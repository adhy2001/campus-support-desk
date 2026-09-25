import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/tickets/:id/comments  { authorId, message }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { authorId, message } = await req.json()

  if (!authorId || !message) {
    return NextResponse.json({ error: 'Missing authorId or message' }, { status: 400 })
  }

  // Verify ticket exists
  const ticket = await prisma.ticket.findUnique({ where: { id } })
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  const comment = await prisma.comment.create({
    data: { ticketId: id, authorId, message },
    include: { author: { select: { id: true, name: true, role: true } } },
  })

  await prisma.activity.create({
    data: {
      ticketId: id,
      action: 'COMMENT_ADDED',
      detail: `${comment.author.name} commented`,
    },
  })

  return NextResponse.json(comment, { status: 201 })
}
