export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { validateEmail, validatePassword, validateName } from '@/lib/validation'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    const nameError = validateName(name)
    if (nameError) return NextResponse.json({ error: nameError }, { status: 400 })

    const emailError = validateEmail(email)
    if (emailError) return NextResponse.json({ error: emailError }, { status: 400 })

    const passwordError = validatePassword(password)
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 })

    const { prisma } = await import('@/lib/prisma')

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        budget: 50000,
        savingsGoal: 25000,
        goalName: 'My Goal',
        persona: 'student',
        onboarded: false,
        currency: 'PKR',
        points: 0,
      },
    })

    const { setSession } = await import('@/lib/session')
    await setSession(user.id)

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      onboarded: user.onboarded,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}