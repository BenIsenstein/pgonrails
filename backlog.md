# Backlog: TanStack Start SaaS Template (`/app`)

Migration from Next.js `/site` to TanStack Start — barebones SaaS template with auth, avatars, and agent hints.

---

## Phase 1: Scaffold & Infrastructure ✅

- [x] **1.1** Clone `start-supabase-basic` example into `/app` via `npx gitpick TanStack/router/tree/main/examples/react/start-supabase-basic app`
- [x] **1.2** Rename package to `pgonrails-start`, verify `pnpm install` and `pnpm dev` work on port 3001
- [x] **1.3** Add Docker service block to `docker-compose.yml` — Node dev container, volume-mount `/app`, expose 3001, run `pnpm dev`
- [x] **1.4** Configure Supabase env vars (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) to point at self-hosted stack

## Phase 2: UI Foundation ✅

- [x] **2.1** Run `npx shadcn@latest init` inside `/app` — configure for Vite, Tailwind v4, Radix Nova style, neutral base
- [x] **2.2** Set up CSS variables and oklch theming (dark mode support) in global stylesheet
- [x] **2.3** Add dark mode toggle using shadcn's official TanStack Start pattern (ScriptOnce + ThemeProvider)
- [x] **2.4** Install `lucide-react` for icons
- [x] **2.5** Add shadcn components needed for auth: `button`, `input`, `label`, `card`, `avatar`, `dropdown-menu`
- [x] **2.6** Add Nitro plugin for production deployment, production Dockerfile, correct plugin order
- [x] **2.7** Copy 4 existing migrations (private_schema, settings, avatars_bucket, avatars_restrict_mime_type)
- [x] **2.8** Remove example posts code, add placeholder dashboard route
- [x] **2.9** Best-practices audit: fix plugin order, move shadcn to devDeps, remove unused deps, add engines field

## Phase 3: Auth — Server Functions & Supabase Client ✅

- [x] **3.1** Port Supabase client utilities (server client with cookie handling + admin client with service_role key)
- [x] **3.2** `fetchUser` server function in root route `beforeLoad` (returns `{ email }` or `null`)
- [x] **3.3** Auth guard: `_authed.tsx` throws `redirect({ to: '/signin', search: { redirect } })` when no user
- [x] **3.4** `signUpFn` — email/password, splits full_name into first_name/last_name metadata
- [x] **3.5** `signInFn` — email/password, returns `AuthResult` discriminated union
- [x] **3.6** `signOutFn` + `/signout` route (invalidate session, redirect to `/`)
- [x] **3.7** `forgotPasswordFn` — sends reset email with redirect to `/reset-password`
- [x] **3.8** `resetPasswordFn` — updates password (user has session from email link)
- [x] **3.9** `deleteAccountFn` — uses admin client to delete user, then signs out session
- [x] **3.10** Auto-login after signup: handled inherently by Supabase when GOTRUE_MAILER_AUTOCONFIRM=true (session cookies set in signUp response)

All server functions centralized in `app/src/server/auth.server.ts`.
Return type: `AuthResult = { success: true } | { success: false; message: string }`.
Pattern: return objects for inline form errors, throw redirect() for navigation.

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

- [x] **5.1** Migrations already copied in Phase 2.7
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
| Auth error handling | Return discriminated unions for forms, throw redirect() for nav | Idiomatic TanStack Start; inline errors for UX, redirects for guards |
| Auth server fns | Single `auth.server.ts` file | Centralized, easy to find, single import |

---

## Reference: Doc URLs for Implementation

Agents working on this codebase should consult these before making changes:

- **TanStack Start Overview**: https://tanstack.com/start/latest/docs/framework/react/overview
- **TanStack Start Getting Started**: https://tanstack.com/start/latest/docs/framework/react/getting-started
- **TanStack Router Auth Guide**: https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes
- **Supabase SSR Auth**: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- **shadcn/ui Vite Install**: https://ui.shadcn.com/docs/installation/vite
- **Tailwind CSS v4**: https://tailwindcss.com/docs
