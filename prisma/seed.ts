import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SLA_HOURS: Record<string, number> = {
  FEES: 24,
  ATTENDANCE: 48,
  ID_CARD: 72,
  DOCUMENTS: 48,
  CERTIFICATES: 96,
  OTHER: 48,
}

function dueIn(hrs: number) {
  return new Date(Date.now() + hrs * 3600 * 1000)
}

async function main() {
  // Wipe existing data (dev convenience)
  await prisma.activity.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.user.deleteMany()

  const student1 = await prisma.user.create({
    data: { name: 'Ravi Kumar', email: 'ravi@college.edu', role: 'STUDENT' },
  })
  const student2 = await prisma.user.create({
    data: { name: 'Meera Nair', email: 'meera@college.edu', role: 'STUDENT' },
  })
  const staff1 = await prisma.user.create({
    data: { name: 'Priya Staff', email: 'priya@college.edu', role: 'STAFF' },
  })
  const staff2 = await prisma.user.create({
    data: { name: 'Anil Staff', email: 'anil@college.edu', role: 'STAFF' },
  })
  await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@college.edu', role: 'ADMIN' },
  })

  const tickets = [
    {
      title: 'Fee receipt not generated',
      description: 'Paid semester fee online but the receipt is not showing up in the portal.',
      category: 'FEES',
      priority: 'HIGH',
      createdById: student1.id,
      assignedToId: staff1.id,
      status: 'IN_PROGRESS',
      slaDueAt: dueIn(SLA_HOURS.FEES),
    },
    {
      title: 'ID card damaged, need reissue',
      description: 'My ID card is cracked and the barcode does not scan anymore.',
      category: 'ID_CARD',
      priority: 'LOW',
      createdById: student1.id,
      assignedToId: staff2.id,
      status: 'OPEN',
      slaDueAt: dueIn(-2), // overdue on purpose for demo
    },
    {
      title: 'Attendance marked absent by mistake',
      description: 'I was present in DBMS class on Monday but marked absent.',
      category: 'ATTENDANCE',
      priority: 'MEDIUM',
      createdById: student2.id,
      assignedToId: null,
      status: 'OPEN',
      slaDueAt: dueIn(SLA_HOURS.ATTENDANCE),
    },
    {
      title: 'Bonafide certificate request',
      description: 'Need a bonafide certificate for a bank loan application.',
      category: 'CERTIFICATES',
      priority: 'MEDIUM',
      createdById: student2.id,
      assignedToId: staff1.id,
      status: 'PENDING_STUDENT',
      slaDueAt: dueIn(SLA_HOURS.CERTIFICATES),
    },
    {
      title: 'Transcript not received',
      description: 'Requested official transcript two weeks ago, still not received.',
      category: 'DOCUMENTS',
      priority: 'URGENT',
      createdById: student1.id,
      assignedToId: null,
      status: 'OPEN',
      slaDueAt: dueIn(-5), // overdue + urgent + unassigned -> should show as escalated
      escalated: true,
    },
    {
      title: 'Portal login issue',
      description: 'Unable to log in to the student portal since yesterday.',
      category: 'OTHER',
      priority: 'HIGH',
      createdById: student2.id,
      assignedToId: staff2.id,
      status: 'RESOLVED',
      resolvedAt: new Date(),
      slaDueAt: dueIn(SLA_HOURS.OTHER),
    },
    {
      title: 'Duplicate charge on fee portal',
      description: 'Was charged twice for the library fee. Need a refund or credit.',
      category: 'FEES',
      priority: 'HIGH',
      createdById: student2.id,
      assignedToId: staff1.id,
      status: 'ESCALATED',
      slaDueAt: dueIn(-1),
      escalated: true,
    },
    {
      title: 'Migration certificate request',
      description: 'Need a migration certificate to apply for a university transfer.',
      category: 'CERTIFICATES',
      priority: 'MEDIUM',
      createdById: student1.id,
      assignedToId: staff2.id,
      status: 'CLOSED',
      resolvedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      slaDueAt: dueIn(-24),
    },
  ]

  for (const t of tickets) {
    const ticket = await prisma.ticket.create({ data: t })
    await prisma.activity.create({
      data: {
        ticketId: ticket.id,
        action: 'CREATED',
        detail: `Ticket created with priority ${ticket.priority}`,
      },
    })
    if (ticket.assignedToId) {
      await prisma.activity.create({
        data: {
          ticketId: ticket.id,
          action: 'ASSIGNED',
          detail: `Assigned to staff`,
        },
      })
    }
    if (ticket.status === 'ESCALATED') {
      await prisma.activity.create({
        data: {
          ticketId: ticket.id,
          action: 'ESCALATED',
          detail: 'Ticket escalated due to SLA breach',
        },
      })
    }
    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      await prisma.activity.create({
        data: {
          ticketId: ticket.id,
          action: 'STATUS_CHANGED',
          detail: `OPEN → ${ticket.status}`,
        },
      })
    }
  }

  // Add sample comments
  const feeTicket = await prisma.ticket.findFirst({ where: { title: 'Fee receipt not generated' } })
  if (feeTicket) {
    await prisma.comment.create({
      data: {
        ticketId: feeTicket.id,
        authorId: staff1.id,
        message: 'Checking with accounts team, will update by EOD.',
      },
    })
    await prisma.activity.create({
      data: {
        ticketId: feeTicket.id,
        action: 'COMMENT_ADDED',
        detail: 'Priya Staff commented',
      },
    })
  }

  const transcriptTicket = await prisma.ticket.findFirst({ where: { title: 'Transcript not received' } })
  if (transcriptTicket) {
    await prisma.comment.create({
      data: {
        ticketId: transcriptTicket.id,
        authorId: student1.id,
        message: 'This is urgent — I have a deadline for the application by end of week.',
      },
    })
    await prisma.activity.create({
      data: {
        ticketId: transcriptTicket.id,
        action: 'COMMENT_ADDED',
        detail: 'Ravi Kumar commented',
      },
    })
  }

  console.log('✅ Seed complete — 8 tickets, 5 users, 2 comments seeded.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
