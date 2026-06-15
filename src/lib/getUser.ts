import { prisma } from '@/lib/prisma'

export async function getDemoUser() {
  let user = await prisma.user.findUnique({ where: { email: 'alex@spendwise.com' } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'alex@spendwise.com',
        name: 'Alex',
        password: 'demo1234',
        budget: 50000,
        savingsGoal: 25000,
        goalName: 'Lahore Trip',
        persona: 'student',
      },
    })
  }
  return user
}