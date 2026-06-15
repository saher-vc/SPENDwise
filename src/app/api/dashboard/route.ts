export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' }
    })

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
    const remaining = user.budget - totalSpent
    const dailyAvg = expenses.length > 0 ? totalSpent / 30 : 0

    const byCategory: Record<string, number> = {}
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
    })

    const weekly: Record<string, number> = {}
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    expenses.forEach(e => {
      const d = new Date(e.date)
      const key = dayNames[d.getDay()]
      weekly[key] = (weekly[key] || 0) + e.amount
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        persona: user.persona,
        budget: user.budget,
        savingsGoal: user.savingsGoal,
        goalName: user.goalName,
        points: user.points,
      },
      expenses,
      byCategory,
      weekly,
      stats: {
  totalSpent,
  remaining,
  dailyAvg,
  budget: user.budget,
  savingsGoal: user.savingsGoal,
  goalName: user.goalName ?? 'My Goal',
  percentUsed: user.budget > 0 ? Math.round((totalSpent / user.budget) * 100) : 0,
  userName: user.name ?? '',
  persona: user.persona ?? '',
  currency: user.currency ?? 'PKR',
}
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
