---
name: modify-auth
description: Modify the authentication system including server functions, guards, user types, and auth pages
---

# Modify Auth

Modify the authentication system.

## Architecture Overview

```
fetchUser (server fn, GET)
  └─ called in __root.tsx beforeLoad
  └─ returns AppUser | null

_authed.tsx beforeLoad
  └─ redirects to /signin if user is null
  └─ narrows context.user to AppUser (non-null)

src/server/auth.ts
  └─ signIn, signUp, signOut, forgotPassword, resetPassword, deleteAccount
  └─ all return AuthResult discriminated union
  └─ all use getSupabaseServerClient() (cookie-bridged)
```

## Key Types

```tsx
// src/utils/types.ts
export type AppUser = {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_img_name: string | null
  avatar_img_cb: string | null  // cache-buster
}
```

## Patterns

### Adding a new auth server function
1. Add to `src/server/auth.ts`
2. Use `createServerFn({ method: 'POST' })` with `.inputValidator()`
3. Return `AuthResult` (discriminated union)
4. Call from page via React Query `useMutation`

### Modifying user metadata
User metadata lives in `auth.users.raw_user_meta_data`. To add a new field:
1. Add to `AppUser` type in `src/utils/types.ts`
2. Update `fetchUser` to extract it from `user.user_metadata`
3. Update `signUp` to include it in the `options.data` object
4. If needed, add a settings component to update it

### Adding a new auth page
1. Create `src/routes/<page>.tsx`
2. Import server function from `@/server/auth`
3. Use `useMutation` from React Query
4. Handle errors inline via `AuthResult.message`
5. Handle navigation via `router.navigate()` or `throw redirect()`

## Key Files
- `src/server/auth.ts` — All server functions
- `src/utils/supabase.ts` — Server client + admin client
- `src/utils/supabase-browser.ts` — Browser client (for settings mutations)
- `src/utils/types.ts` — `AppUser` type
- `src/routes/__root.tsx` — `fetchUser`, provides user in router context
- `src/routes/_authed.tsx` — Auth guard + type narrowing

## Pitfalls
- `fetchUser` must explicitly declare `Promise<AppUser | null>` return type (TypeScript can't infer through the null check)
- Never use `useServerFn()` — call server functions directly with React Query
- The admin client (`getSupabaseAdminClient`) uses `SERVICE_ROLE_KEY` and bypasses RLS — use sparingly
- `deleteAccount` uses the admin client to call `auth.admin.deleteUser()`
- Password update uses the browser client (not server function) because Supabase requires the session context
