export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(expenses)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await req.json()

    if (!body.amount || !body.description || !body.category) {
      return NextResponse.json({ error: 'amount, description and category are required' }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        amount: parseFloat(body.amount),
        description: body.description,
        category: body.category,
        date: body.date ? new Date(body.date) : new Date(),
      }
    })
    return NextResponse.json(expense)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}
