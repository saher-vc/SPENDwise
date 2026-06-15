import { signIn } from '@/auth'
import { prisma } from '@/lib/prisma'
import { setSession } from '@/lib/session'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL))
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL))
    }

    await setSession(user.id)

    if (!user.onboarded) {
      return NextResponse.redirect(new URL('/onboarding', process.env.NEXTAUTH_URL))
    }

    return NextResponse.redirect(new URL('/dashboard', process.env.NEXTAUTH_URL))
  } catch (err) {
    console.error(err)
    return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL))
  }
}