# EduCore RW — School Management Platform

A complete multi-tenant school management system built for Rwandan schools,
aligned with the Ministry of Education format.

## Project Structure

```
educore-rw/
├── apps/
│   ├── admin/          → Principal + Superadmin dashboard (Next.js, port 3001)
│   ├── teacher-app/    → Offline PWA for teachers (Next.js, port 3002)
│   └── web/            → Public marketing site (Next.js, port 3000)
├── packages/
│   ├── types/          → Shared TypeScript interfaces
│   ├── firebase/       → Firebase client + Admin SDK helpers
│   ├── utils/          → Grading, ranking, billing, R2, ImageKit utilities
│   ├── ui/             → Shared React components
│   └── email/          → Resend email templates
├── firestore.rules     → Security rules
├── firestore.indexes.json → Composite indexes
└── .env.local          → Environment variables (DO NOT COMMIT)
```

## Prerequisites

- Node.js 20+
- npm 10+
- Firebase project (already configured)
- Cloudflare R2 bucket named `educore`
- ImageKit account
- Resend account

## Quick Start

```bash
# 1. Install all dependencies
npm install

# 2. Copy environment file (already pre-filled with your keys)
# Review .env.local — add FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY
# Download service account from Firebase Console → Project Settings → Service Accounts

# 3. Deploy Firestore rules and indexes
npm install -g firebase-tools
firebase login
firebase use educorerw
firebase deploy --only firestore

# 4. Start all apps in development
npm run dev

# Or start individually:
npm run dev:admin     # http://localhost:3001
npm run dev:teacher   # http://localhost:3002
npm run dev:web       # http://localhost:3000
```

## Environment Variables

See `.env.local` for all required variables. Key ones:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase client config (safe to expose) |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Firebase Admin service account email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase Admin private key |
| `R2_*` | Cloudflare R2 credentials |
| `NEXT_PUBLIC_IMAGEKIT_*` | ImageKit URL and public key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key (server only) |
| `RESEND_API_KEY` | Resend API key for emails |

## User Hierarchy

```
Superadmin (you)
  └── Principal (created by superadmin, gets email invite)
        ├── Deputy (created by principal, custom permissions)
        └── Teacher (created by principal, gets email invite)
              └── Parent (reads via student code — no account needed)
```

## Key Features

- **Marks**: CA + Exam per subject, configurable maxima per headmaster
- **Grading**: Rwanda 7-grade scale (A/B/C/D/E/S/F), nursery uses descriptors
- **Reports**: Progressive (term) and Annual (full year) PDF reports — MoE format
- **Conduct**: Out of 40, included in grand total
- **Ranking**: Dense ranking, position shown as X/Y
- **Offline**: Teacher app caches everything in IndexedDB, syncs when online
- **Files**: Teacher uploads with 4-month auto-expiry, stored in Cloudflare R2
- **Timetable**: Visual weekly grid builder per class and term
- **Attendance**: Daily per class, attendance rate on reports
- **Ads**: Superadmin pushes ads to principals/teachers/parents

## Pricing

| Plan | Price |
|---|---|
| Up to 300 students | 170,000 Rwf/year (flat) |
| Above 300 students | 700 Rwf × student count/year |

## Deployment

All three apps deploy to Vercel independently:

```bash
# Deploy admin
cd apps/admin && vercel --prod

# Deploy teacher-app
cd apps/teacher-app && vercel --prod

# Deploy web
cd apps/web && vercel --prod
```

Set environment variables in each Vercel project dashboard.

## Student ID Format

```
GSK·2526·0042
 │    │    └─ Sequential number (4 digits, per school per year)
 │    └────── Academic year short (2025-2026 → 2526)
 └─────────── School abbreviation
```

## Report Card Format

Matches Kingdom of Salomon School B format exactly:
- Republic of Rwanda / Ministry of Education header
- Both school logos
- All 3 terms side by side (annual) or single term (progressive)
- TS + EX + TOT + GR columns per term
- Annual Total + % + Grade
- First Decision / Final Decision checkboxes
- QR code for verification
- Class teacher remarks + parent signature + headmaster stamp
