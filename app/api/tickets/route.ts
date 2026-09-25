import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Category, Priority, computeSlaDueDate, isOverdue, shouldAutoEscalate, ageInHours } from '@/lib/ticketLogic'

// GET /api/tickets?status=OPEN&category=FEES&assignedToId=xxx&createdById=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const assignedToId = searchParams.get('assignedToId')
  const createdById = searchParams.get('createdById')

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(assignedToId ? { assignedToId } : {}),
      ...(createdById ? { createdById } : {}),
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const enriched = tickets.map((t) => ({
    ...t,
    overdue: isOverdue(t.slaDueAt, t.status as any),
    autoEscalate: shouldAutoEscalate(t as any),
    ageHours: ageInHours(t.createdAt),
  }))

  return NextResponse.json(enriched)
}

// POST /api/tickets  { title, description, category, priority, createdById }
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, description, category, priority, createdById } = body

  if (!title || !description || !category || !createdById) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      category: category as Category,
      priority: (priority as Priority) || 'MEDIUM',
      createdById,
      slaDueAt: computeSlaDueDate(category as Category),
    },
  })

  await prisma.activity.create({
    data: {
      ticketId: ticket.id,
      action: 'CREATED',
      detail: `Ticket raised by student, priority ${ticket.priority}`,
    },
  })

  return NextResponse.json(ticket, { status: 201 })
}
