<div align="center">

<!-- Animated Header -->
<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=28&pause=1000&color=3B82F6&center=true&vCenter=true&width=600&lines=Smart+Public+Complaint+Resolver" alt="header" />

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=400&size=14&pause=2000&color=64748B&center=true&vCenter=true&width=600&lines=AI-Powered+Issue+Management+for+Modern+Communities" alt="subheader" />

<br/><br/>

<!-- Tech Badges -->
<a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.2-000?style=flat-square&logo=next.js" height="22"/></a>
<a href="https://react.dev"><img src="https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react" height="22"/></a>
<a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript" height="22"/></a>
<a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss" height="22"/></a>
<a href="https://openai.com"><img src="https://img.shields.io/badge/AI-GPT4-10A37F?style=flat-square&logo=openai" height="22"/></a>
<a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase" height="22"/></a>

<br/>

<img src="https://img.shields.io/badge/⚡-Framer%20Motion-purple?style=flat-square&logo=framer" height="22"/>
<img src="https://img.shields.io/badge/📧-Resend-orange?style=flat-square" height="22"/>
<img src="https://img.shields.io/badge/📱-Twilio-red?style=flat-square&logo=twilio" height="22"/>

<br/><br/>

<img src="https://komarev.com/ghpvc/?username=vijay2git&label=Profile%20Views&color=3B82F6&style=flat" alt="views" />

</div>

---

## What It Does

Citizens submit complaints → AI analyzes and routes → Teams resolve → Everyone stays informed.

---

## Features

| | Feature | Description |
|:-:|---------|-------------|
| 🤖 | **AI Analysis** | Auto-classifies issues, scores severity, finds duplicates |
| 🎯 | **Smart Routing** | Routes to the right department automatically |
| 📍 | **Location Pin** | Citizens pin exact issue location |
| 📱 | **Notifications** | Email + SMS at every stage |
| 👁️ | **Live Tracking** | Real-time status updates |
| 📊 | **Admin Dashboard** | Manage everything in one place |

---

## How It Works

```
Citizen submits issue → AI analyzes → System routes → Team resolves → Updates sent
```

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 16, React 18, Tailwind CSS |
| Animations | Framer Motion |
| Backend | Next.js API Routes |
| Database | Supabase |
| AI | OpenAI GPT-4 |
| Email | Resend |
| SMS | Twilio |

---

## Quick Start

```bash
git clone https://github.com/vijay2git/smart_public_complaint-resolver.git
cd smart_public_complaint-resolver
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`

---

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=      # Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase key
OPENAI_API_KEY=                 # OpenAI key
RESEND_API_KEY=                 # Resend key
TWILIO_ACCOUNT_SID=             # Twilio SID
TWILIO_AUTH_TOKEN=              # Twilio token
TWILIO_PHONE_NUMBER=            # Twilio phone
```

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/complaints` | List all |
| `POST` | `/api/complaints` | Create new |
| `POST` | `/api/ai/analyze` | AI analysis |
| `POST` | `/api/emails/send` | Send email |
| `POST` | `/api/notifications/sms` | Send SMS |

---

## Commands

```bash
npm run dev        # Start dev
npm run build      # Production build
npm run lint       # Check code
npm run typecheck  # Check types
```

---

## Contributing

Fork → Branch → Code → Commit → Push → PR

---

<div align="center">

<img src="https://github-readme-stats.vercel.app/api?username=vijay2git&show_icons=true&theme=tokyonight&hide_border=true&bg_color=0D1117" alt="stats" height="150"/>
<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=vijay2git&theme=tokyonight&hide_border=true&bg_color=0D1117&layout=compact" alt="langs" height="150"/>

</div>

---

<div align="center">

**MIT License** · Built with care for better communities

</div>
