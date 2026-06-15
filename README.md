# 💰 SpendWise

> Pakistan's first Gen-Z focused expense tracker with AI financial advisor, voice logging, bill scanning, gamified challenges, and social bill splitting.

![SpendWise](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-5-blue?style=for-the-badge&logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-teal?style=for-the-badge&logo=tailwindcss)

## 🚀 Live Demo

[spendwise-app.vercel.app](https://spendwise-app.vercel.app)

## ✨ Features

### 💸 Core Finance

- Real-time budget tracking with spending progress
- Daily average calculator
- Savings goal tracker with custom goal names
- Multi-currency support (PKR, USD, SAR, AED, GBP, EUR)
- Category-based expense tracking

### 🤖 AI Features

- **SpendWise AI Chatbot** — knows your exact budget, spending, and savings goal
- Gives personalized advice in Pakistani Rupees
- Contextual financial tips based on your real data

### 🎤 Smart Input

- **Voice Log** — speak your expense and it auto-fills the form
- **Bill Scanner** (Premium) — photograph any receipt and auto-extract the total amount using OCR

### 🎮 Gamification

- Points system — earn points by completing challenges
- Badges — unlock automatically when challenges are completed
- Challenges — Skip chai run, No-spend weekend, 5 green days streak, Log 7 expenses

### 👥 Social

- Friend system — search by email, send/accept/reject requests
- Bill splitting — create splits, assign amounts, track who paid
- Payment integration — JazzCash, Easypaisa, Bank Transfer options

### 🔐 Authentication

- Email/password signup and login
- Secure httpOnly cookie sessions
- Google OAuth (Continue with Google)
- bcrypt password hashing

### 📱 App Experience

- Mobile-first design
- Splash screen → Intro carousel → Onboarding wizard
- Bottom navigation
- Persona-based experience (Student, Professional, Freelancer)
- Mood check-in on dashboard

## 🛠️ Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Frontend   | Next.js 14, TypeScript, Tailwind CSS |
| Backend    | Next.js API Routes                   |
| Database   | PostgreSQL (Supabase)                |
| ORM        | Prisma                               |
| Auth       | Custom sessions + NextAuth (Google)  |
| AI         | Groq API (LLaMA 3.3 70B)             |
| OCR        | Tesseract.js                         |
| Voice      | Web Speech API                       |
| Deployment | Vercel                               |

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/saher-vc/SPENDwise.git
cd SPENDwise

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your values

# Push database schema
npx prisma db push

# Seed challenges and badges
npx prisma db seed

# Run development server
npm run dev
```

## 🔑 Environment Variables

```env
DATABASE_URL=
DIRECT_URL=
GROQ_API_KEY=
NEXTAUTH_SECRET=
AUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## 📱 Pages

| Route          | Description                          |
| -------------- | ------------------------------------ |
| `/splash`      | Animated splash screen               |
| `/intro`       | 3-slide onboarding carousel          |
| `/login`       | Email/password + Google auth         |
| `/onboarding`  | 4-step personalization wizard        |
| `/dashboard`   | Main dashboard with real-time stats  |
| `/add-expense` | Add expense with voice/scan          |
| `/analytics`   | Charts, trends, categories, insights |
| `/chatbot`     | AI financial advisor                 |
| `/friends`     | Friends, splits, payments            |
| `/challenges`  | Gamified saving challenges           |
| `/settings`    | Profile, currency, budget settings   |

## 🏆 What Makes SpendWise Different

1. **Built for Pakistan** — Rs currency, local context, Pakistani payment apps
2. **AI that knows YOUR money** — not generic tips, real personalized advice
3. **Voice + Scan input** — fastest expense logging on the market
4. **Gamification** — makes saving fun and rewarding
5. **Social splitting** — no need for a separate Splitwise app

## 👨‍💻 Developer

Built with ❤️ by **Saher**

---

_SpendWise — Your smart money sidekick ✨_
