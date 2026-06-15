export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { auth } = await import('@/auth')
    const session = await auth()

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/login', baseUrl))
    }

    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/login', baseUrl))
    }

    const { setSession } = await import('@/lib/session')
    await setSession(user.id)

    if (!user.onboarded) {
      return NextResponse.redirect(new URL('/onboarding', baseUrl))
    }

    return NextResponse.redirect(new URL('/dashboard', baseUrl))
  } catch (err) {
    console.error('Google auth callback error:', err)
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    return NextResponse.redirect(new URL('/login', baseUrl))
  }
}