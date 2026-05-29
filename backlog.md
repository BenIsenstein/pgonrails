# Backlog: TanStack Start SaaS Template (`/app`)

Migration from Next.js `/site` to TanStack Start — barebones SaaS template with auth, avatars, and agent hints.

---

## Phase 1: Scaffold & Infrastructure

- [ ] **1.1** Clone `start-supabase-basic` example into `/app` via `npx gitpick TanStack/router/tree/main/examples/react/start-supabase-basic app`
- [ ] **1.2** Rename package to `pgonrails-start`, verify `pnpm install` and `pnpm dev` work on port 3001
- [ ] **1.3** Add Docker service block to `docker-compose.yml` — Node dev container, volume-mount `/app`, expose 3001, run `pnpm dev`
- [ ] **1.4** Configure Supabase env vars (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) to point at self-hosted stack

## Phase 2: UI Foundation

- [ ] **2.1** Run `npx shadcn@latest init` inside `/app` — configure for Vite, Tailwind v4, New York style, neutral base
- [ ] **2.2** Set up CSS variables and oklch theming (dark mode support) in global stylesheet
- [ ] **2.3** Add dark mode toggle mechanism (CSS class strategy, no `next-themes` — use a simple React context or cookie-based approach)
- [ ] **2.4** Install `lucide-react` for icons
- [ ] **2.5** Add shadcn components needed for auth: `button`, `input`, `label`, `card`, `avatar`, `dropdown-menu`

## Phase 3: Auth — Server Functions & Supabase Client

- [ ] **3.1** Port Supabase client utilities (server client with cookie handling for TanStack Start's server functions)
- [ ] **3.2** Implement `fetchUser` server function in root route `beforeLoad` (already in example — adapt for our cookie/session pattern)
- [ ] **3.3** Add auth guard: redirect unauthenticated users from protected routes (`/dashboard`, `/settings`) to `/signin`
- [ ] **3.4** Implement `signup` server function (email/password, writes full_name to user metadata)
- [ ] **3.5** Implement `signin` server function (email/password, redirect to `/dashboard`)
- [ ] **3.6** Implement `signout` server function (invalidate session, redirect to `/`)
- [ ] **3.7** Implement `forgotPassword` server function (send reset email)
- [ ] **3.8** Implement `resetPassword` server function (update password)
- [ ] **3.9** Implement `deleteAccount` server function (uses service_role admin client)
- [ ] **3.10** Handle auto-login after signup (when GOTRUE_MAILER_AUTOCONFIRM is enabled)

## Phase 4: Pages & Routes

- [ ] **4.1** `/` — Landing page (simple marketing hero, CTA to sign up)
- [ ] **4.2** `/signin` — Sign in form (email + password)
- [ ] **4.3** `/signup` — Sign up form (full name + email + password + confirm password)
- [ ] **4.4** `/forgot-password` — Forgot password form (email input, sends reset link)
- [ ] **4.5** `/reset-password` — Reset password form (new password + confirm)
- [ ] **4.6** `/dashboard` — Authenticated empty shell (welcome message, placeholder for user's app)
- [ ] **4.7** `/settings` — Settings page with sections:
  - Update display name
  - Update email
  - Update password
  - Upload/change avatar
  - Delete account
- [ ] **4.8** Auth callback route — handle email confirmation OTP token exchange
- [ ] **4.9** Shared layout with navbar (context-aware: landing vs authenticated)

## Phase 5: Avatar / Profile Picture

- [ ] **5.1** Copy migrations into `/app/supabase/migrations/`:
  - `20251007001359_create_private_schema.sql`
  - `20251007001610_settings.sql`
  - `20250929033529_add_avatars_bucket.sql`
  - `20260205063412_avatars_restrict_mime_type.sql`
- [ ] **5.2** Implement avatar upload component (Supabase Storage, per-user folder `avatars/{uid}/`)
- [ ] **5.3** Port the `trg_objects_user_avatar_img_name` trigger logic (sync avatar metadata to `auth.users.raw_user_meta_data`)
- [ ] **5.4** Display avatar in navbar and settings page using Supabase Storage public URLs

## Phase 6: Agent Hints & Documentation

- [ ] **6.1** Write `AGENTS.md` at `/app` root:
  - Architecture overview (TanStack Start + Supabase self-hosted)
  - File structure guide
  - Key patterns (server functions, auth guard, Supabase client setup)
  - Doc URLs to consult:
    - https://tanstack.com/start/latest/docs/framework/react/overview
    - https://tanstack.com/start/latest/docs/framework/react/guide/routing
    - https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
    - https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes
    - https://supabase.com/docs/guides/auth/server-side/creating-a-client
    - https://ui.shadcn.com/docs/installation/vite
  - Instructions for agents: "Always check these URLs before implementing routing or auth changes"
- [ ] **6.2** Add inline `// AI:` comments at key files:
  - Root route (`__root.tsx`) — explains beforeLoad auth pattern
  - Supabase server client — explains cookie bridging for SSR
  - Auth guard logic — explains redirect pattern
  - Avatar upload — explains storage bucket + trigger sync
- [ ] **6.3** Add `.cursor/rules` or equivalent IDE agent context file (optional, if desired)

## Phase 7: Cleanup & Polish

- [ ] **7.1** Remove example-specific code (Posts demo routes/components from the cloned example)
- [ ] **7.2** Update `README.md` in `/app` with setup instructions
- [ ] **7.3** Verify full auth flow works end-to-end against self-hosted Supabase stack
- [ ] **7.4** Verify avatar upload/display works
- [ ] **7.5** Verify dark mode toggle persists across page navigations
- [ ] **7.6** Ensure `pnpm build` produces a working production build

---

## Design Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Starting point | Clone `start-supabase-basic` | Gets Supabase SSR auth wiring for free |
| Package manager | pnpm | Fast, disk-efficient, matches TanStack examples |
| Port | 3001 | Avoids conflict with existing site on 3000 |
| UI library | shadcn/ui via CLI | Identical DX to current site, official Vite support |
| Auth providers | Email/password only | Minimal SaaS template scope |
| Toasts | None | Keep minimal; users add as needed |
| Realtime | None | Trello-specific, not SaaS-generic |
| Dark mode | Yes (CSS class + context) | Expected in modern SaaS templates |
| Avatars | Supabase Storage bucket + trigger | Proven pattern from current site |
| Agent hints | AGENTS.md + inline comments | Best balance of discoverability and context |
| Docker | Dev container with volume mount | Consistent with rest of stack |
| DB schema | 4 migrations (no Trello) | Only auth/avatars infrastructure |

---

## Reference: Doc URLs for Implementation

Agents working on this codebase should consult these before making changes:

- **TanStack Start Overview**: https://tanstack.com/start/latest/docs/framework/react/overview
- **TanStack Start Getting Started**: https://tanstack.com/start/latest/docs/framework/react/getting-started
- **TanStack Router Auth Guide**: https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes
- **Supabase SSR Auth**: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- **shadcn/ui Vite Install**: https://ui.shadcn.com/docs/installation/vite
- **Tailwind CSS v4**: https://tailwindcss.com/docs
