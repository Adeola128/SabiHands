# SabiHands 🤝

**Nigeria's Volunteer Marketplace** — connecting passionate volunteers with NGOs and social impact organizations.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://sabihands.vercel.app)
[![Built with React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3fcf8e?logo=supabase)](https://supabase.com)

---

## About

SabiHands bridges the gap between skilled volunteers and the organisations that need them. Volunteers can browse gigs, apply, check in, and earn verified digital certificates. Organizations can post gigs, review applicants, mark attendance, and issue certificates — all in one platform.

## Features

- 🔐 **Auth** — Email + Google OAuth via Supabase Auth
- 👤 **Volunteer Onboarding** — Skills, location, and availability profile
- 🏢 **Organization Onboarding** — CAC registration and org type
- 📋 **Browse & Apply** — Volunteers discover and apply for gigs
- ✅ **Attendance & Certificates** — Digital check-in and verifiable certificates
- 💬 **Messaging** — Direct conversations between volunteers and orgs
- 🏅 **Community Board** — Posts, comments, and likes
- 🛡️ **Admin Panel** — Verification queue, user management, moderation

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Vanilla CSS, Framer Motion |
| Backend | Supabase (Postgres + Auth + Storage) |
| Email | Brevo (Transactional) |
| Deployment | Vercel |
| Testing | Vitest + React Testing Library |

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/sabihands.git
cd sabihands

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Fill in your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 4. Run the database schema
# Open Supabase SQL Editor and paste: supabase_schema.sql

# 5. Start the dev server
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## Running Tests

```bash
npx vitest run --pool=forks
```

## Deployment

The app deploys to Vercel. `vercel.json` handles SPA routing so all React Router paths work on refresh.

1. Push this repo to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables
4. Deploy — done!

## License

MIT
