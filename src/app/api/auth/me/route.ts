export const dynamic = 'force-dynamic'

import { getCurrentUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    onboarded: user.onboarded,
    budget: user.budget,
    savingsGoal: user.savingsGoal,
    goalName: user.goalName,
    persona: user.persona,
  })
}
