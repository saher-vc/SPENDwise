export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { NextResponse } from 'next/server'

// GET — get my friends + incoming requests
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const accepted = await prisma.friendship.findMany({
    where: {
      OR: [
        { senderId: user.id, status: 'accepted' },
        { receiverId: user.id, status: 'accepted' },
      ]
    },
    include: { sender: true, receiver: true }
  })

  const incoming = await prisma.friendship.findMany({
    where: { receiverId: user.id, status: 'pending' },
    include: { sender: true }
  })

  const outgoing = await prisma.friendship.findMany({
    where: { senderId: user.id, status: 'pending' },
    include: { receiver: true }
  })

  const friends = accepted.map(f => {
    const friend = f.senderId === user.id ? f.receiver : f.sender
    return { friendshipId: f.id, ...friend }
  })

  return NextResponse.json({ friends, incoming, outgoing })
}

// POST — send friend request or accept/reject
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await req.json()
  const { action, email, friendshipId } = body

  // Search user by email
  if (action === 'search') {
    const found = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true }
    })
    if (!found) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (found.id === user.id) return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 })
    return NextResponse.json({ user: found })
  }

  // Send friend request
  if (action === 'send') {
    const { targetUserId } = body
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: user.id },
        ]
      }
    })
    if (existing) return NextResponse.json({ error: 'Request already exists' }, { status: 400 })

    const friendship = await prisma.friendship.create({
      data: { senderId: user.id, receiverId: targetUserId, status: 'pending' }
    })

    // Award first_friend badge check
    await checkAndAwardBadge(user.id, 'first_friend')

    return NextResponse.json({ friendship })
  }

  // Accept request
  if (action === 'accept') {
    const friendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'accepted' }
    })
    return NextResponse.json({ friendship })
  }

  // Reject request
  if (action === 'reject') {
    await prisma.friendship.delete({ where: { id: friendshipId } })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

async function checkAndAwardBadge(userId: string, condition: string) {
  const badge = await prisma.badge.findFirst({ where: { condition } })
  if (!badge) return
  const already = await prisma.userBadge.findFirst({ where: { userId, badgeId: badge.id } })
  if (already) return
  await prisma.userBadge.create({ data: { userId, badgeId: badge.id } })
}
