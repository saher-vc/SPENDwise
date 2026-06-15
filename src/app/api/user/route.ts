export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await req.json()

    const data: Record<string, any> = {}
    if (typeof body.persona === 'string') data.persona = body.persona
    if (typeof body.budget === 'number') data.budget = body.budget
    if (typeof body.savingsGoal === 'number') data.savingsGoal = body.savingsGoal
    if (typeof body.goalName === 'string') data.goalName = body.goalName
    if (typeof body.onboarded === 'boolean') data.onboarded = body.onboarded
    if (typeof body.currency === 'string') data.currency = body.currency

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    })

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      persona: updated.persona,
      budget: updated.budget,
      savingsGoal: updated.savingsGoal,
      goalName: updated.goalName,
      onboarded: updated.onboarded,
      currency: updated.currency,
    })
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
