import { prisma } from '@/lib/prisma'
import { setSession } from '@/lib/session'
import { validateEmail } from '@/lib/validation'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const emailError = validateEmail(email)
    if (emailError) return NextResponse.json({ error: emailError }, { status: 400 })

    if (!password) return NextResponse.json({ error: 'Password is required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })

    // Generic error to avoid leaking which emails exist
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

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