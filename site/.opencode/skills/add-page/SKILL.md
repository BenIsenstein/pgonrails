---
name: add-page
description: Create a new TanStack Start route with file-based routing, layout nesting, and auth protection
---

# Add Page

Create a new TanStack Start route (page).

## Prerequisites
- Understand TanStack Router file-based routing
- Routes live in `app/src/routes/`

## Docs
- https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing
- https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes

## Workflow

1. **Decide if the page is protected or public:**
   - Public: create `src/routes/<name>.tsx`
   - Protected (requires auth): create `src/routes/_authed/<name>.tsx`

2. **Create the route file:**
   ```tsx
   import { createFileRoute } from '@tanstack/react-router'

   export const Route = createFileRoute('/<path>')({
     component: PageComponent,
   })

   function PageComponent() {
     return <div>Your page</div>
   }
   ```

3. **For protected pages**, access user from route context:
   ```tsx
   function PageComponent() {
     const { user } = Route.useRouteContext()
     // user is typed as AppUser (non-null, narrowed by _authed guard)
   }
   ```

4. **Build to regenerate route tree:**
   ```bash
   pnpm vite build
   ```
   Or the route tree auto-regenerates during `pnpm dev`.

## Key Files
- `src/routes/__root.tsx` — Root layout, provides `user` context via `fetchUser`
- `src/routes/_authed.tsx` — Auth guard layout, narrows user type to non-null
- `src/routeTree.gen.ts` — Auto-generated, never edit manually

## Route Naming Conventions
- File name = URL path: `src/routes/settings.tsx` → `/settings`
- Nested folders: `src/routes/auth/confirm.tsx` → `/auth/confirm`
- Layout routes (prefix `_`): `src/routes/_authed.tsx` — groups child routes under a shared guard/layout without adding a URL segment
- Dynamic params: `src/routes/users/$userId.tsx` → `/users/:userId`

## Search Params
```tsx
export const Route = createFileRoute('/page')({
  validateSearch: (search: Record<string, unknown>) => ({
    myParam: (search.myParam as string) ?? undefined,
  }) as { myParam?: string },
})
```

## Pitfalls
- Never edit `routeTree.gen.ts` — it's auto-generated
- Files named `*.server.ts` cannot be imported from route files (blocked by import-protection plugin)
- The route tree only regenerates on build or during dev server — if tsc complains about missing routes, run `pnpm vite build`
