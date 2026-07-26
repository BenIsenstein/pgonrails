---
name: postgrest-query
description: Query Supabase tables via PostgREST using the typed JavaScript client with RLS policies
---

# PostgREST Query

Query Supabase/PostgreSQL tables using the Supabase JS client (PostgREST under the hood).

## Prerequisites
- Tables defined in migrations (`app/supabase/migrations/`)
- RLS policies configured for the table
- Supabase client available (server or browser)

## Docs
- https://supabase.com/docs/reference/javascript/select
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Workflow

### Server-side queries (in server functions)
```tsx
import { getSupabaseServerClient } from '@/utils/supabase'

export const fetchItems = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
})
```

### Client-side queries (in components, e.g. settings)
```tsx
import { createBrowserClient } from '@/utils/supabase-browser'

const supabase = createBrowserClient()
const { data, error } = await supabase
  .from('items')
  .select('id, name, status')
  .eq('user_id', userId)
```

### With React Query (recommended for client-side)
```tsx
const { data } = useQuery({
  queryKey: ['items', userId],
  queryFn: async () => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase.from('items').select('*')
    if (error) throw error
    return data
  },
})
```

## Common Patterns

### Filters
```tsx
.eq('column', value)        // equals
.neq('column', value)       // not equals
.gt('column', value)        // greater than
.gte('column', value)       // greater than or equal
.lt('column', value)        // less than
.in('column', [v1, v2])    // in array
.is('column', null)         // is null
.ilike('column', '%term%') // case-insensitive like
```

### Pagination
```tsx
.range(0, 9)  // first 10 rows (0-indexed, inclusive)
```

### Joins (foreign key relationships)
```tsx
.select('*, profiles(full_name, avatar_url)')
```

### Inserts / Updates
```tsx
await supabase.from('items').insert({ name: 'New', user_id: userId })
await supabase.from('items').update({ name: 'Updated' }).eq('id', itemId)
```

## Key Files
- `src/utils/supabase.ts` — Server client (use in server functions)
- `src/utils/supabase-browser.ts` — Browser client (use in components)
- `supabase/migrations/` — Table definitions and RLS policies

## Pitfalls
- All queries respect RLS. If a query returns empty but data exists, check your RLS policy.
- The server client uses cookie-bridged auth — it sees the same user as the browser session.
- The admin client (`getSupabaseAdminClient`) bypasses RLS — only use for admin operations.
- Always handle the `error` return — Supabase never throws, it returns `{ data, error }`.
- For typed queries, generate types with `npx supabase gen types typescript --local` after schema changes.
