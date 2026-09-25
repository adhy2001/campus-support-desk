import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Status, isOverdue, shouldAutoEscalate, isValidTransition, ageInHours } from '@/lib/ticketLogic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      comments: {
        include: { author: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
      activity: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    ...ticket,
    overdue: isOverdue(ticket.slaDueAt, ticket.status as Status),
    autoEscalate: shouldAutoEscalate(ticket as any),
    ageHours: ageInHours(ticket.createdAt),
  })
}

// PATCH /api/tickets/:id  { status?, assignedToId?, priority?, escalate? }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const existing = await prisma.ticket.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const activities: { action: string; detail: string }[] = []
  const data: Record<string, unknown> = {}

  if (body.status && body.status !== existing.status) {
    if (!isValidTransition(existing.status as Status, body.status as Status)) {
      return NextResponse.json(
        { error: `Cannot move ticket from ${existing.status} to ${body.status} directly` },
        { status: 400 }
      )
    }
    data.status = body.status as Status
    if (body.status === 'RESOLVED') data.resolvedAt = new Date()
    activities.push({ action: 'STATUS_CHANGED', detail: `${existing.status} → ${body.status}` })
  }

  if (body.assignedToId !== undefined && body.assignedToId !== existing.assignedToId) {
    data.assignedToId = body.assignedToId || null
    activities.push({
      action: 'ASSIGNED',
      detail: body.assignedToId ? `Reassigned to staff ${body.assignedToId}` : 'Unassigned',
    })
  }

  if (body.priority && body.priority !== existing.priority) {
    data.priority = body.priority
    activities.push({ action: 'PRIORITY_CHANGED', detail: `${existing.priority} → ${body.priority}` })
  }

  if (body.escalate === true && !existing.escalated) {
    data.escalated = true
    data.status = 'ESCALATED' as Status
    activities.push({ action: 'ESCALATED', detail: 'Manually escalated by staff' })
  }

  // If nothing to update, return existing ticket unchanged
  if (Object.keys(data).length === 0) {
    return NextResponse.json(existing)
  }

  const updated = await prisma.ticket.update({ where: { id }, data })

  for (const a of activities) {
    await prisma.activity.create({ data: { ticketId: id, action: a.action, detail: a.detail } })
  }

  return NextResponse.json(updated)
}
