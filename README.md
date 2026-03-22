# Smart Public Complaint Resolver

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18.2-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan?style=flat-square&logo=tailwindcss)
![AI Powered](https://img.shields.io/badge/AI-Powered-OpenAI-green?style=flat-square&logo=openai)

An intelligent, AI-powered citizen complaint management system built for modern municipalities.

[Features](#features) • [Demo](#demo) • [Getting Started](#getting-started) • [API](#api) • [Contributing](#contributing)

---

</div>

## Overview

**Smart Public Complaint Resolver** is a cutting-edge web application designed to streamline the process of reporting and resolving community issues. Leveraging AI technology, the system intelligently classifies, prioritizes, and routes complaints to the appropriate departments, ensuring rapid resolution and improved citizen satisfaction.

![Hero Section](https://img.shields.io/badge/Dark%20Mode-Enabled-1a1a1a?style=for-the-badge)

## Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| **AI-Powered Analysis** | Automatic classification, severity scoring, and duplicate detection using OpenAI |
| **Smart Routing** | Intelligent assignment to appropriate departments based on issue type |
| **Real-Time Tracking** | Citizens can track their complaint status throughout the resolution process |
| **Multi-Channel Notifications** | Email (Resend) and SMS (Twilio) notifications at every stage |
| **Admin Dashboard** | Comprehensive management interface for administrators |

### Technical Highlights

- **Modern Stack**: Next.js 16, React 18, TypeScript 5.4
- **Animations**: Smooth, professional animations with Framer Motion
- **Database**: Supabase for real-time data management
- **Styling**: Tailwind CSS with custom dark theme
- **Forms**: React Hook Form with Zod validation
- **Responsive Design**: Mobile-first approach with elegant desktop experience

## Demo

<div align="center">

| Citizen Submission | Admin Dashboard |
|:---:|:---:|
| Submit complaints with detailed descriptions | Manage and track all issues |
| Upload images and location data | AI-powered insights and analytics |
| Receive real-time updates | Assign tasks to departments |

</div>

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Resend API key (for emails)
- Twilio account (for SMS)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/smart-complaint-resolver.git
cd smart-complaint-resolver
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Environment Setup**

Copy the environment template and configure your variables:

```bash
cp .env.local.example .env.local
```

Configure the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Resend (Email)
RESEND_API_KEY=your_resend_api_key

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   │   ├── ai/           # AI analysis endpoints
│   │   ├── complaints/   # Complaint management
│   │   ├── emails/       # Email notifications
│   │   └── notifications/# SMS notifications
│   ├── complaint/         # Citizen-facing pages
│   │   ├── submit/       # Complaint submission
│   │   └── track/        # Issue tracking
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   └── ui/               # Animated UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions & configs
└── types/                 # TypeScript type definitions
```

## API Reference

### Complaints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/complaints` | GET | List all complaints |
| `/api/complaints` | POST | Submit new complaint |
| `/api/complaints/[id]` | GET | Get complaint details |
| `/api/complaints/[id]` | PATCH | Update complaint status |

### AI Analysis

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/analyze` | POST | Analyze complaint with AI |
| `/api/ai/classify` | POST | Classify issue category |
| `/api/ai/severity` | POST | Calculate severity score |

### Notifications

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/emails/send` | POST | Send email notification |
| `/api/notifications/sms` | POST | Send SMS notification |

## Issue Categories

The system supports various community issue categories:

- **Road Damage** - Potholes, cracks, road hazards
- **Water Systems** - Leaks, drainage, water quality
- **Street Lighting** - Broken lights, dark areas
- **Waste Management** - Collection issues, illegal dumping
- **Noise Control** - Noise violations, disturbances
- **Parking Issues** - Illegal parking, signage
- **Pedestrian Safety** - Crosswalks, sidewalks
- **Vandalism** - Graffiti, property damage

## Technologies

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 16, React 18, Tailwind CSS, Framer Motion |
| **Backend** | Next.js API Routes, Supabase |
| **AI/ML** | OpenAI GPT-4 |
| **Notifications** | Resend (Email), Twilio (SMS) |
| **Validation** | Zod, React Hook Form |
| **Type Safety** | TypeScript 5.4 |

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@complaintresolver.com or open an issue on GitHub.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Backend Infrastructure
- [OpenAI](https://openai.com/) - AI Capabilities
- [Tailwind CSS](https://tailwindcss.com/) - Styling Framework
- [Framer Motion](https://www.framer.com/motion/) - Animation Library

---

<div align="center">

**Built with care for better communities**

[⬆ Back to Top](#smart-public-complaint-resolver)

</div>
