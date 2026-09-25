// SLA window per category, in hours. Reflects that some requests
// (certificates) legitimately take longer to process than others (ID cards).
// Note: With SQLite on Prisma 5.22+, enums are stored as plain strings.
// These are the canonical enum values used throughout the application.

export type Category = 'FEES' | 'ATTENDANCE' | 'ID_CARD' | 'DOCUMENTS' | 'CERTIFICATES' | 'OTHER'
export type Status = 'OPEN' | 'IN_PROGRESS' | 'PENDING_STUDENT' | 'RESOLVED' | 'CLOSED' | 'ESCALATED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type Role = 'STUDENT' | 'STAFF' | 'ADMIN'

export const SLA_HOURS: Record<Category, number> = {
  FEES: 24,
  ATTENDANCE: 48,
  ID_CARD: 72,
  DOCUMENTS: 48,
  CERTIFICATES: 96,
  OTHER: 48,
}

export function computeSlaDueDate(category: Category): Date {
  return new Date(Date.now() + SLA_HOURS[category] * 3600 * 1000)
}

// A ticket is "overdue" if it's still open work and past its SLA date.
// Computed on read rather than stored, so it's always accurate.
export function isOverdue(slaDueAt: Date, status: Status): boolean {
  const stillOpen = !(['RESOLVED', 'CLOSED'] as Status[]).includes(status)
  return stillOpen && new Date(slaDueAt).getTime() < Date.now()
}

// Auto-escalation rule: URGENT priority + unassigned + already overdue
// should never sit quietly in a queue. This is evaluated on every read/patch
// rather than via a background cron job, which keeps the prototype simple.
export function shouldAutoEscalate(params: {
  priority: string
  assignedToId: string | null
  slaDueAt: Date
  status: string
}): boolean {
  const { priority, assignedToId, slaDueAt, status } = params
  if ((['RESOLVED', 'CLOSED'] as Status[]).includes(status as Status)) return false
  return priority === 'URGENT' && !assignedToId && isOverdue(slaDueAt, status as Status)
}

// Legal status transitions. Prevents skipping straight from OPEN to RESOLVED,
// which would erase the "someone actually worked on this" signal.
const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  OPEN: ['IN_PROGRESS', 'ESCALATED', 'CLOSED'],
  IN_PROGRESS: ['PENDING_STUDENT', 'RESOLVED', 'ESCALATED', 'OPEN'],
  PENDING_STUDENT: ['IN_PROGRESS', 'RESOLVED', 'ESCALATED'],
  ESCALATED: ['IN_PROGRESS', 'RESOLVED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'], // allow reopening
  CLOSED: ['IN_PROGRESS'],             // allow reopening a closed ticket
}

export function isValidTransition(from: Status, to: Status): boolean {
  if (from === to) return true
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

export function ageInHours(createdAt: Date): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 3600000)
}
