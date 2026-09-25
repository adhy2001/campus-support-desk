import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@/lib/ticketLogic'

// GET /api/users?role=STAFF
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role') as Role | null

  const users = await prisma.user.findMany({
    where: role ? { role } : {},
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(users)
}
