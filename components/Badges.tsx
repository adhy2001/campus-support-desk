const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-800',
  PENDING_STUDENT: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-slate-200 text-slate-600',
  ESCALATED: 'bg-red-100 text-red-800',
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-sky-100 text-sky-700',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800 font-bold',
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  PENDING_STUDENT: 'Pending Student',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  ESCALATED: 'Escalated',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}
    >
      {STATUS_LABELS[status] || status.replace(/_/g, ' ')}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-600'}`}
    >
      {priority}
    </span>
  )
}

export function OverdueBadge({ overdue }: { overdue: boolean }) {
  if (!overdue) return null
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white whitespace-nowrap animate-pulse">
      OVERDUE
    </span>
  )
}

export function EscalateBadge() {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white whitespace-nowrap">
      ESCALATED
    </span>
  )
}
