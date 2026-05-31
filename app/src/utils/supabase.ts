// AI: Supabase server client for use in TanStack Start server functions.
// Uses getCookies/setCookie from @tanstack/react-start/server to bridge
// Supabase's cookie-based auth with the SSR request/response cycle.
import { getCookies, setCookie } from '@tanstack/react-start/server'
import { createServerClient } from '@supabase/ssr'

export function getSupabaseServerClient() {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
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
