---
name: deploy
description: Deploy the application to production using Docker, Supabase hosted, and environment configuration
---

# Deploy

Deploy the application to production.

## Architecture (Production)

```
Production Dockerfile (multi-stage)
  ├─ Stage 1: Build (pnpm install + vite build)
  └─ Stage 2: Runtime (Node 22 slim, runs built output)

Supabase hosted project
  └─ Migrations applied via supabase db push
  └─ Edge functions (if any) via supabase functions deploy
```

## Workflow

### 1. Build production image
```bash
docker build -f Dockerfile -t pgonrails-app ./app
```
The production `Dockerfile` (in project root) does a multi-stage build:
- Installs dependencies
- Runs `pnpm vite build`
- Copies built output to a slim runtime image

### 2. Push migrations to hosted Supabase
```bash
cd app && npx supabase link --project-ref <project-ref>
npx supabase db push
```
This applies any new migrations to the remote database.

### 3. Set environment variables
Required production env vars:
```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SITE_URL=https://your-domain.com
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### 4. Run the container
```bash
docker run -p 3000:3000 --env-file .env.production pgonrails-app
```

## Pre-deploy Checklist
- [ ] `pnpm vite build` succeeds locally
- [ ] `pnpm tsc --noEmit` passes (no type errors)
- [ ] All migrations applied: `npx supabase db push`
- [ ] Environment variables set in hosting platform
- [ ] `SITE_URL` matches actual production domain (used in auth emails)
- [ ] Storage buckets exist on remote (created by migrations)

## Key Files
- `Dockerfile` — Production multi-stage build
- `dev.Dockerfile` — Development only (NOT for production)
- `docker-compose.yml` — Local dev only
- `app/.env.example` — Template for required env vars
- `app/supabase/config.toml` — Supabase project config

## Hosting Options
The production Docker image is a standard Node.js container. Deploy to:
- Railway, Render, Fly.io (Docker support)
- AWS ECS / GCP Cloud Run
- Any VPS with Docker installed

## Pitfalls
- Never deploy with `SERVICE_ROLE_KEY` exposed to the client (only server-side)
- `VITE_` prefixed vars are baked into the client bundle at build time — they must be set at build, not just runtime
- If auth emails show wrong URLs, check `SITE_URL` in both your app env and Supabase dashboard (Authentication → URL Configuration)
- The production image does NOT include Supabase CLI — migrations are pushed separately, not at runtime
