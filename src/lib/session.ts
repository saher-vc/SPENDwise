import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const COOKIE_NAME = 'spendwise_session'

export async function setSession(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get(COOKIE_NAME)?.value
  if (!userId) return null

  const user = await prisma.user.findUnique({ where: { id: userId } })
  return user
}