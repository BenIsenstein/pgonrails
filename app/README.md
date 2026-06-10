# PgOnRails — App

Barebones SaaS template built with TanStack Start, self-hosted Supabase, shadcn/ui, and Tailwind v4.

## What's Included

- Email/password authentication (sign up, sign in, forgot/reset password, delete account)
- Avatar upload with Supabase Storage
- User settings (display name, email, password, avatar)
- Dark mode (Light / Dark / System) with cookie persistence
- Protected routes with type-safe auth guards
- Docker-based development environment with self-hosted Supabase

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start (Vite + Nitro) |
| Router | TanStack Router (file-based) |
| Data | React Query + Supabase JS client |
| Database | PostgreSQL via self-hosted Supabase |
| UI | shadcn/ui + Tailwind v4 (oklch) |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (avatars bucket) |
| Dev env | Docker Compose |

## Quick Start (Docker)

```bash
# 1. Copy env file
cp app/.env.example app/.env

# 2. Start everything (app + self-hosted Supabase)
docker compose up --build

# 3. Open
open http://localhost:3001
```

The dev container handles `pnpm install`, starts the Supabase stack, applies migrations, and runs the Vite dev server.

## Quick Start (Local)

```bash
cd app

# 1. Install
pnpm install

# 2. Start Supabase (requires Docker)
npx supabase start

# 3. Copy env and fill in keys from `supabase status`
cp .env.example .env

# 4. Run dev server
pnpm dev
```

## Environment Variables

See `.env.example` for all required variables:

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase API URL (server-side) |
| `SUPABASE_ANON_KEY` | Supabase anonymous key (server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for user deletion (server-side only) |
| `SITE_URL` | App URL for auth email redirects |
| `VITE_SUPABASE_URL` | Supabase URL (client-side) |
| `VITE_SUPABASE_ANON_KEY` | Anon key (client-side) |
| `VITE_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION` | Enable OTP verification for password changes |

## Project Structure

```
app/
├── src/
│   ├── routes/           # File-based routing (TanStack Router)
│   │   ├── __root.tsx    # Root layout (fetchUser, Navbar, Toaster)
│   │   ├── _authed.tsx   # Auth guard layout
│   │   ├── _authed/      # Protected pages (settings, dashboard)
│   │   ├── signin.tsx    # Public auth pages
│   │   └── ...
│   ├── server/
│   │   └── auth.ts       # Server functions (signIn, signUp, etc.)
│   ├── components/
│   │   ├── ui/           # shadcn/ui primitives
│   │   ├── settings/     # Settings page components
│   │   └── navbar.tsx    # App navbar
│   ├── utils/
│   │   ├── supabase.ts   # Server Supabase client (cookie-bridged)
│   │   ├── supabase-browser.ts  # Browser client
│   │   └── types.ts      # AppUser type
│   └── app.css           # Tailwind v4 + oklch theme variables
├── supabase/
│   └── migrations/       # SQL migrations (applied in timestamp order)
├── .opencode/skills/     # Agent skill definitions
└── AGENTS.md             # Agent routing table
```

## Build

```bash
cd app
pnpm vite build     # Production build
pnpm tsc --noEmit   # Type check
```

## Useful URLs (Local Dev)

| Service | URL |
|---------|-----|
| App | http://localhost:3001 |
| Supabase Studio | http://localhost:54323 |
| Inbucket (email) | http://localhost:54324 |
| Supabase API | http://localhost:54321 |
