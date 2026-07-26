// AI: Supabase browser client singleton for client-side operations.
// Used in settings components for direct mutations (updateUser, storage upload).
// After mutations, call router.invalidate() to refresh server-side user context.
// Docs: https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=tanstack
import { createBrowserClient } from '@supabase/ssr'
import { STORAGE_KEY } from './supabase-constants'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!,
      {
        auth: { storageKey: STORAGE_KEY },
      },
    )
  }
  return browserClient
}
