---
name: docker-dev
description: Work with the Docker-based development environment including compose, volumes, and container debugging
---

# Docker Dev

Work with the Docker-based development environment.

## Architecture

```
docker compose up
  └─ dev (app container)
  │    ├─ Node 22 + pnpm
  │    ├─ Supabase CLI
  │    ├─ Volume mount: ./app → /app
  │    └─ Port 3001 (Vite dev server)
  └─ supabase (managed by supabase CLI inside dev container)
       ├─ Port 54321 (API)
       ├─ Port 54323 (Studio)
       └─ Port 54324 (Inbucket email)
```

## Common Commands

### Start development
```bash
docker compose up --build
```
The `dev` container runs `pnpm install && npx supabase start && pnpm dev`.

### Access the container
```bash
docker compose exec dev sh
```

### Reset database (inside container)
```bash
npx supabase db reset
```

### View logs
```bash
docker compose logs -f dev
```

### Full rebuild (after Dockerfile changes)
```bash
docker compose down && docker compose up --build
```

## Key Files
- `docker-compose.yml` — Defines `dev` service
- `dev.Dockerfile` — Node 22 + pnpm + Supabase CLI + Docker CLI
- `app/.env` — Env vars (copied into container via volume mount)

## Ports
| Service | Port | URL |
|---------|------|-----|
| App (Vite) | 3001 | http://localhost:3001 |
| Supabase API | 54321 | http://localhost:54321 |
| Supabase Studio | 54323 | http://localhost:54323 |
| Inbucket (email) | 54324 | http://localhost:54324 |

## Volume Mount
The `./app` directory is mounted into the container at `/app`. Changes on host are immediately reflected in the container (hot reload works).

`node_modules` is NOT volume-mounted (uses a named volume inside the container for performance). If you add a new dependency, the container must run `pnpm install` (happens automatically on container start).

## Environment Variables
The container reads from `app/.env`. Key vars:
- `SUPABASE_URL=http://host.docker.internal:54321` (or `http://kong:8000` if using internal network)
- `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — from `supabase status`
- `SITE_URL=http://localhost:3001`

## Pitfalls
- If Supabase containers fail to start, ensure Docker has enough memory (4GB+ recommended)
- `host.docker.internal` resolves to the host machine from inside containers (macOS/Windows)
- If `pnpm install` hangs, check your network/proxy settings in the container
- The dev container needs Docker socket access to manage Supabase containers (Docker-in-Docker via socket mount)
