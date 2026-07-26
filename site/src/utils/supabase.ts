// AI: Supabase server client for use in TanStack Start server functions.
// Uses getCookies/setCookie from @tanstack/react-start/server to bridge
// Supabase's cookie-based auth with the SSR request/response cycle.
// Docs: https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=tanstack
import { getCookies, setCookie } from '@tanstack/react-start/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { STORAGE_KEY } from './supabase-constants'

export function getSupabaseServerClient() {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: { storageKey: STORAGE_KEY },
      cookies: {
        getAll() {
          return Object.entries(getCookies()).map(([name, value]) => ({
            name,
            value: value ?? '',
          }))
        },
        setAll(cookies: Array<{ name: string; value: string; options?: object }>) {
          cookies.forEach((cookie) => {
            setCookie(cookie.name, cookie.value)
          })
        },
      },
    },
  )
}

// AI: Admin client uses service_role key to bypass RLS.
// Only used for operations that require elevated privileges (e.g., deleteUser).
// NEVER expose this client or its key to the browser.
export function getSupabaseAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { storageKey: STORAGE_KEY },
    },
  )
}
