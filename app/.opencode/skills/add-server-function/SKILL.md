---
name: add-server-function
description: Create a new TanStack Start server function with input validation, typed returns, and React Query integration
---

# Add Server Function

Create a new TanStack Start server function (RPC endpoint).

## Prerequisites
- Server functions use `createServerFn` from `@tanstack/react-start`
- They run on the server but are callable from client components

## Docs
- https://tanstack.com/start/latest/docs/framework/react/server-functions

## Workflow

1. **Add to `src/server/auth.ts`** (for auth-related functions) or create a new file in `src/server/`:
   ```tsx
   import { createServerFn } from '@tanstack/react-start'
   import { getSupabaseServerClient } from '@/utils/supabase'

   export const myFn = createServerFn({ method: 'POST' })
     .inputValidator((d: { someField: string }) => d)
     .handler(async ({ data }) => {
       const supabase = getSupabaseServerClient()
       // ... your logic
       return { success: true }
     })
   ```

2. **Call from a component** (directly, not via `useServerFn`):
   ```tsx
   import { useMutation } from '@tanstack/react-query'
   import { myFn } from '@/server/my-file'

   const mutation = useMutation({
     mutationFn: (data: { someField: string }) => myFn({ data }),
   })
   ```

3. **For GET requests** (data fetching in loaders):
   ```tsx
   export const fetchData = createServerFn({ method: 'GET' }).handler(async () => {
     // ...
     return data
   })
   ```

## Key Patterns

### Input Validation
Use `.inputValidator()` to type and validate input:
```tsx
.inputValidator((d: { email: string; password: string }) => d)
```

### Return Types
For mutations that can fail, return a discriminated union:
```tsx
export type AuthResult =
  | { success: true }
  | { success: false; message: string }
```

### Redirects
Throw `redirect()` for navigation-level concerns:
```tsx
import { redirect } from '@tanstack/react-router'
throw redirect({ to: '/signin' })
```

## Key Files
- `src/server/auth.ts` — All auth server functions
- `src/utils/supabase.ts` — `getSupabaseServerClient()` (cookie-bridged, for use in server functions)

## Pitfalls
- Do NOT name files `*.server.ts` — the import-protection plugin blocks client imports of those files. `createServerFn` already handles the server boundary.
- Do NOT use `useServerFn()` — call server functions directly. React Query handles lifecycle (abort, state tracking). `useServerFn` loses TypeScript generics.
- Server functions that take no input: call as `myFn()` (no arguments needed)
- Server functions that take input: call as `myFn({ data: { ... } })`
