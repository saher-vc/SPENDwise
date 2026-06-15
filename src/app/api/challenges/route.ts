export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const all = await prisma.challenge.findMany()
    const userChallenges = await prisma.userChallenge.findMany({
      where: { userId: user.id },
      include: { challenge: true }
    })
    const badges = await prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true }
    })
    const allBadges = await prisma.badge.findMany()

    return NextResponse.json({
      challenges: all,
      userChallenges,
      badges: badges.map(b => b.badge),
      allBadges,
      points: user.points ?? 0
    })
  } catch (error) {
    console.error('Challenges GET error:', error)
    return NextResponse.json({ error: 'Failed to load challenges' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { action, challengeId, userChallengeId } = await req.json()

    if (action === 'join') {
      const existing = await prisma.userChallenge.findFirst({
        where: { userId: user.id, challengeId }
      })
      if (existing) return NextResponse.json({ error: 'Already joined' }, { status: 400 })

      const uc = await prisma.userChallenge.create({
        data: { userId: user.id, challengeId, progress: 0 }
      })
      return NextResponse.json({ userChallenge: uc })
    }

    if (action === 'progress') {
      const uc = await prisma.userChallenge.findUnique({
        where: { id: userChallengeId },
        include: { challenge: true }
      })
      if (!uc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      const newProgress = uc.progress + 1
      const completed = newProgress >= uc.challenge.target

      const updated = await prisma.userChallenge.update({
        where: { id: userChallengeId },
        data: { progress: newProgress, completed }
      })

      if (completed) {
        await prisma.user.update({
          where: { id: user.id },
          data: { points: { increment: uc.challenge.points } }
        })

        try {
          const badgeCondition = `complete_${uc.challengeId}`
          const badge = await prisma.badge.findFirst({ where: { condition: badgeCondition } })
          if (badge) {
            const already = await prisma.userBadge.findFirst({
              where: { userId: user.id, badgeId: badge.id }
            })
            if (!already) {
              await prisma.userBadge.create({ data: { userId: user.id, badgeId: badge.id } })
            }
          }
        } catch (e) {
          console.log('Badge award skipped:', e)
        }
      }

      return NextResponse.json({ userChallenge: updated, completed })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Challenges POST error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
