export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const splits = await prisma.split.findMany({
    where: {
      OR: [
        { createdById: user.id },
        { participants: { some: { userId: user.id } } }
      ]
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      participants: {
        include: { user: { select: { id: true, name: true, email: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ splits })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { title, totalAmount, participants } = await req.json()
  // participants: [{ userId, amount }]

  if (!title || !totalAmount || !participants?.length) {
    return NextResponse.json({ error: 'title, totalAmount, and participants required' }, { status: 400 })
  }

  const split = await prisma.split.create({
    data: {
      title,
      totalAmount,
      createdById: user.id,
      participants: {
        create: [
          { userId: user.id, amount: participants.find((p: any) => p.userId === user.id)?.amount ?? 0, paid: true },
          ...participants
            .filter((p: any) => p.userId !== user.id)
            .map((p: any) => ({ userId: p.userId, amount: p.amount, paid: false }))
        ]
      }
    },
    include: { participants: { include: { user: true } } }
  })

  return NextResponse.json({ split })
}

// PATCH — mark as paid
export async function PATCH(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { splitParticipantId } = await req.json()
  const updated = await prisma.splitParticipant.update({
    where: { id: splitParticipantId },
    data: { paid: true }
  })

  return NextResponse.json({ updated })
}
