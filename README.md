<div align="center">

# Smart Public Complaint Resolver

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=500&size=20&pause=1000&color=3B82F6&center=true&vCenter=true&random=false&width=500&lines=AI-Powered+Issue+Management;Built+for+Modern+Communities" alt="typing" />

<br/>

<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" height="28"/>
<img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" height="28"/>
<img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" height="28"/>
<img src="https://img.shields.io/badge/Tailwind-3.4-cyan?style=for-the-badge&logo=tailwindcss" height="28"/>
<img src="https://img.shields.io/badge/OpenAI-GPT4-green?style=for-the-badge&logo=openai" height="28"/>
<img src="https://img.shields.io/badge/Supabase-Database-black?style=for-the-badge&logo=supabase" height="28"/>

</div>

---

## Overview

An intelligent platform where citizens submit community issues and AI handles the rest — classifying, prioritizing, and routing complaints to the right teams instantly.

**How it works:** Citizens report → AI analyzes → Teams resolve → Everyone gets notified.

---

## Features

| Feature | Description |
|---------|-------------|
| **AI Analysis** | Auto-classifies issues, scores severity, detects duplicates |
| **Smart Routing** | Routes complaints to appropriate departments |
| **Real-time Tracking** | Citizens track status from submission to resolution |
| **Notifications** | Email and SMS alerts at every stage |
| **Admin Dashboard** | Manage, assign, and monitor all complaints |

---

## Tech Stack

**Frontend:** Next.js 16, React 18, Tailwind CSS, Framer Motion

**Backend:** Next.js API Routes, Supabase

**AI:** OpenAI GPT-4

**Notifications:** Resend (Email), Twilio (SMS)

---

## Quick Start

```bash
# Clone
git clone https://github.com/vijay2git/smart_public_complaint-resolver.git
cd smart_public_complaint-resolver

# Install
npm install

# Configure
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# OpenAI
OPENAI_API_KEY=

# Resend
RESEND_API_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

---

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin dashboard
│   ├── api/            # API routes
│   │   ├── ai/         # AI endpoints
│   │   ├── complaints/ # Complaint CRUD
│   │   └── notifications/
│   └── complaint/      # Citizen pages
├── components/         # UI components
├── lib/                # Utilities
└── types/              # TypeScript types
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/complaints` | List complaints |
| POST | `/api/complaints` | Submit complaint |
| POST | `/api/ai/analyze` | AI analysis |
| POST | `/api/emails/send` | Send email |
| POST | `/api/notifications/sms` | Send SMS |

---

## Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run lint       # Lint code
npm run typecheck  # Type checking
```

---

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

MIT

---

<div align="center">

**Built with care for better communities**

[⬆ Back to top](#smart-public-complaint-resolver)

</div>
