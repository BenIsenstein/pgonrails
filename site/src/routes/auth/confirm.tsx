// AI: Email OTP verification callback route.
// Handles links from signup confirmation and password reset emails.
// Supabase sends ?token_hash=...&type=...&next=... — we verify the OTP
// and redirect to `next` on success, or to /?error=... on failure.
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '@/utils/supabase'
import type { EmailOtpType } from '@supabase/supabase-js'

const confirmEmail = createServerFn({ method: 'GET' })
  .inputValidator((d: { tokenHash: string; type: string; next: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()

    const { error } = await supabase.auth.verifyOtp({
      token_hash: data.tokenHash,
      type: data.type as EmailOtpType,
    })

    if (error) {
      throw redirect({
        to: '/',
        search: {
          error: error.name,
          error_description: error.message,
        },
      })
    }

    throw redirect({ to: data.next || '/' })
  })

export const Route = createFileRoute('/auth/confirm')({
  validateSearch: (search: Record<string, unknown>) => ({
    token_hash: (search.token_hash as string) || '',
    type: (search.type as string) || '',
    next: (search.next as string) || '/',
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    confirmEmail({
      data: {
        tokenHash: deps.token_hash,
        type: deps.type,
        next: deps.next,
      },
    }),
})
