// AI: Centralized auth server functions for TanStack Start.
// All auth operations live here. They return discriminated unions for form-level
// errors (displayed inline) and throw redirect() for navigation-level concerns.
// Docs: https://tanstack.com/start/latest/docs/framework/react/server-functions
import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient, getSupabaseAdminClient } from '../utils/supabase'

// AI: Discriminated union type for auth operation results.
// Components check `result.success` to determine whether to show an error message.
type AuthResult =
  | { success: true }
  | { success: false; message: string }

// --- Sign In ---

export const signInFn = createServerFn({ method: 'POST' })
  .inputValidator((d: { email: string; password: string }) => d)
  .handler(async ({ data }): Promise<AuthResult> => {
    const supabase = getSupabaseServerClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      return { success: false, message: error.message }
    }

    return { success: true }
  })

// --- Sign Up ---
// AI: Collects full_name and splits into first_name/last_name in user_metadata.
// Returns `confirmed` flag so client can branch: navigate to dashboard (autoconfirm on)
// or show "check your email" toast (autoconfirm off).
// Detects duplicate email via empty identities array (Supabase returns fake success).

type SignUpResult =
  | { success: true; confirmed: true }
  | { success: true; confirmed: false }
  | { success: false; message: string }

export const signUpFn = createServerFn({ method: 'POST' })
  .inputValidator((d: { email: string; password: string; fullName: string }) => d)
  .handler(async ({ data }): Promise<SignUpResult> => {
    const supabase = getSupabaseServerClient()

    const firstName = data.fullName.split(' ')[0] ?? ''
    const lastName = data.fullName.split(' ').slice(1).join(' ') || firstName

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          first_name: firstName,
          last_name: lastName,
          avatar_img_name: '',
          avatar_img_cb: '',
        },
      },
    })

    if (error) {
      return { success: false, message: error.message }
    }

    // Duplicate email: Supabase returns a user with empty identities to avoid
    // leaking whether the email exists. Surface a hint to the user.
    if (signUpData.user?.identities?.length === 0) {
      return { success: false, message: 'An account with this email may already exist. Try signing in.' }
    }

    // Session present = autoconfirm is on, user is immediately authenticated
    if (signUpData.session) {
      return { success: true, confirmed: true }
    }

    // No session = email confirmation required
    return { success: true, confirmed: false }
  })

// --- Forgot Password ---
// AI: Sends a password reset email via Supabase. The redirect URL points to
// the /reset-password route where the user sets a new password.

export const forgotPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator((d: { email: string }) => d)
  .handler(async ({ data }): Promise<AuthResult> => {
    const supabase = getSupabaseServerClient()
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.SITE_URL}/reset-password`,
    })

    if (error) {
      return { success: false, message: error.message }
    }

    return { success: true }
  })

// --- Reset Password ---
// AI: Called after the user clicks the email link and lands on /reset-password.
// The Supabase auth session is already established via the email link's token.

export const resetPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }): Promise<AuthResult> => {
    const supabase = getSupabaseServerClient()
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (error) {
      return { success: false, message: error.message }
    }

    return { success: true }
  })

// --- Delete Account ---
// AI: Uses the admin client (service_role key) because Supabase does not allow
// users to delete their own accounts via the regular client.

export const deleteAccountFn = createServerFn({ method: 'POST' })
  .handler(async (): Promise<AuthResult> => {
    const supabase = getSupabaseServerClient()
    const { data: { user }, error: getUserError } = await supabase.auth.getUser()

    if (getUserError || !user) {
      return { success: false, message: 'Not authenticated' }
    }

    const admin = getSupabaseAdminClient()
    const { error } = await admin.auth.admin.deleteUser(user.id)

    if (error) {
      return { success: false, message: error.message }
    }

    // Sign out the now-deleted user's session
    await supabase.auth.signOut()

    return { success: true }
  })
