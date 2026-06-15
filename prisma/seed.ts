import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Challenges
  const challenges = [
    { id: 'ch1', title: 'Skip 1 chai run this week', description: 'Make chai at home instead of buying outside.', points: 50, type: 'single', target: 1 },
    { id: 'ch2', title: 'No-spend weekend', description: 'Lock your cards and enjoy free things in life.', points: 100, type: 'single', target: 1 },
    { id: 'ch3', title: '5 green days in a row', description: 'Stay under your daily budget for five consecutive days.', points: 200, type: 'streak', target: 5 },
    { id: 'ch4', title: 'Log 7 expenses in a week', description: 'Build the habit of tracking every expense.', points: 75, type: 'weekly', target: 7 },
  ]

  for (const c of challenges) {
    await prisma.challenge.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    })
  }

  // Badges
  const badges = [
    { id: 'b1', name: 'First Step', emoji: '👣', description: 'Added your first expense', condition: 'first_expense' },
    { id: 'b2', name: 'Chai King', emoji: '☕', description: 'Completed the chai challenge', condition: 'complete_ch1' },
    { id: 'b3', name: 'Weekend Warrior', emoji: '🛡️', description: 'Completed no-spend weekend', condition: 'complete_ch2' },
    { id: 'b4', name: 'Green Streak', emoji: '🌿', description: 'Completed 5 green days', condition: 'complete_ch3' },
    { id: 'b5', name: 'Habit Builder', emoji: '📝', description: 'Logged 7 expenses in a week', condition: 'complete_ch4' },
    { id: 'b6', name: 'Social Saver', emoji: '🤝', description: 'Added your first friend', condition: 'first_friend' },
  ]

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { id: b.id },
      update: b,
      create: b,
    })
  }

  console.log('Seeded challenges and badges')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())