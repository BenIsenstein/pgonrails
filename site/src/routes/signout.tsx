// AI: Sign-out route. Signs out then redirects to home.
import { redirect, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '../utils/supabase'

const handleSignOut = createServerFn({ method: 'POST' }).handler(async () => {
  const supabase = getSupabaseServerClient()
  await supabase.auth.signOut()
  throw redirect({ to: '/' })
})

export const Route = createFileRoute('/signout')({
  preload: false,
  loader: () => handleSignOut(),
})
