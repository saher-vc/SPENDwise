import { prisma } from '@/lib/prisma'
import { setSession } from '@/lib/session'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL ?? 'http://localhost:3000'))
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL ?? 'http://localhost:3000'))
    }

    await setSession(user.id)

    if (!user.onboarded) {
      return NextResponse.redirect(new URL('/onboarding', process.env.NEXTAUTH_URL ?? 'http://localhost:3000'))
    }

    return NextResponse.redirect(new URL('/dashboard', process.env.NEXTAUTH_URL ?? 'http://localhost:3000'))
  } catch (err) {
    console.error('Google auth callback error:', err)
    return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL ?? 'http://localhost:3000'))
  }
}