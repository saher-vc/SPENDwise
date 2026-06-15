import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const existing = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existing) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name ?? 'User',
                password: 'google-oauth',
                persona: 'student',
                budget: 50000,
                savingsGoal: 25000,
                goalName: 'My Goal',
                onboarded: false,
                currency: 'PKR',
                points: 0,
              },
            })
          }
          return true
        } catch (err) {
          console.error('Google sign in error:', err)
          return false
        }
      }
      return true
    },

    async session({ session }) {
      if (session.user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
          })
          if (dbUser) {
            (session.user as any).id = dbUser.id;
            (session.user as any).onboarded = dbUser.onboarded;
          }
        } catch (err) {
          console.error('Session callback error:', err)
        }
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
  },

  trustHost: true,
})