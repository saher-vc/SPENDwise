export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { validateEmail } from '@/lib/validation'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const emailError = validateEmail(email)
    if (emailError) return NextResponse.json({ error: emailError }, { status: 400 })
    if (!password) return NextResponse.json({ error: 'Password is required' }, { status: 400 })

    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const bcrypt = await import('bcryptjs')
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const { setSession } = await import('@/lib/session')
    await setSession(user.id)

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      onboarded: user.onboarded,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
