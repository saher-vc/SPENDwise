import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ reply: "Please log in first!" }, { status: 401 })

    const { message, history } = await req.json()

    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 15,
    })

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
    const remaining = user.budget - totalSpent
    const dailyAvg = totalSpent / 30

    const byCategory: Record<string, number> = {}
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
    })
    const categorySummary = Object.entries(byCategory)
      .map(([cat, amt]) => `${cat}: Rs ${amt.toLocaleString()}`)
      .join(', ')

    const recentList = expenses
      .slice(0, 8)
      .map(e => `${e.description} (${e.category}): Rs ${e.amount.toLocaleString()}`)
      .join(', ')

    const systemPrompt = `You are "SpendWise AI" — a friendly, knowledgeable personal financial advisor built into a Gen-Z-focused expense tracking app for users in Pakistan.

ROLE & TONE:
- Act as a real financial advisor: give practical, actionable, and honest advice.
- Tone is warm, casual, and encouraging — Gen-Z friendly with light emojis, but NEVER sacrifice accuracy for vibes.
- Keep responses concise (2-4 sentences) unless the user asks for a detailed breakdown.
- Always use Pakistani Rupees (Rs) for all amounts — never use $ or other currencies.

USER PROFILE:
- Name: ${user.name}
- Persona: ${user.persona}
- Monthly budget: Rs ${user.budget.toLocaleString()}
- Total spent this month: Rs ${totalSpent.toLocaleString()}
- Remaining budget: Rs ${remaining.toLocaleString()}
- Daily average spend: Rs ${dailyAvg.toFixed(0)}
- Savings goal: Rs ${user.savingsGoal.toLocaleString()} (${user.goalName})
- Spending by category: ${categorySummary || 'No data yet'}
- Recent transactions: ${recentList || 'No transactions yet'}

GUIDELINES:
- When asked "can I afford X", calculate against their actual remaining budget and daily average.
- When asked for savings tips, reference their actual top spending categories.
- If they are overspending, be supportive but honest — suggest specific realistic adjustments.
- You can suggest budgeting frameworks (50/30/20 rule, envelope method) when relevant.
- Do not give investment, tax, or legal advice — recommend a licensed professional for those.
- Stay in character as part of the SpendWise app.`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((m: { sender: string; text: string }) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
      { role: 'user', content: message },
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 400,
        messages,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Groq API error:', errText)
      return NextResponse.json({ reply: "Hmm, I'm having trouble thinking right now 😅 Try again in a sec!" })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't come up with a reply 😅"
    return NextResponse.json({ reply })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ reply: "Oops, something broke on my end 🛠️" }, { status: 500 })
  }
}