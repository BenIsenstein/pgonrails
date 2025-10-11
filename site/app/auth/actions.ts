"use server"

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from "next/navigation"
import { revalidatePath } from 'next/cache'

const PUBLIC_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5173"

export async function resetPassword(currentState: { message: string }, formData: FormData) {
    const supabase = await createClient()
    const passwordData = {
        password: formData.get('password') as string,
        confirm_password: formData.get('confirm_password') as string,
    }
    
    if (passwordData.password !== passwordData.confirm_password) {
        return { message: "Passwords do not match" }
    }

    const { error } = await supabase.auth.updateUser({
        password: passwordData.password
    })

    if (error) {
        return { message: error.message }
    }

    redirect(`/dashboard?message=Your+password+has+been+successfully+reset.`)
}


export async function forgotPassword(currentState: { message: string }, formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
        return { message: error.message }
    }

    redirect("/forgot-password?message=Please+check+your+email+to+reset+your+password.")
}


export async function signup(currentState: { message: string }, formData: FormData) {
    const supabase = await createClient()
    const full_name = formData.get('name') as string

    // in practice, you should validate your inputs before going right into auth.signUp()

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                full_name,
                first_name: full_name.split(" ")[0],
                last_name: full_name.split(" ").reverse()[0],
                avatar_img_name: "",
                avatar_img_cb: ""
            }
        }
    })

    if (signUpError) {
        if (signUpError.message.includes("already registered")) {
            return {
                message: "An account with this email already exists. Please sign in instead."
            }
        }

        return {
            message: signUpError.message
        }
    }

    if (!signUpData?.user) {
        return {
            message: "Failed to create user"
        }
    }

    // Redirect straight to dashboard if they are auto-confirming emails
    if (signUpData.user.user_metadata.email_verified) {
        redirect("/dashboard?message=Welcome!+You+successfully+signed+up.&refresh_browser_auth")
    }

    redirect("/signup?message=Please+check+your+email+to+confirm+your+signup.")
}


export async function signIn(currentState: { message: string }, formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { message: error.message }
    }

    redirect("/dashboard?refresh_browser_auth")
}


export async function signout() {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut({ scope: "local" })
    // handle error?

    revalidatePath('/', 'layout') // ??
    redirect("/?refresh_browser_auth")
}


export async function signInWithGoogle() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${PUBLIC_URL}/auth/callback`,
        },
    })

    if (data.url) {
        redirect(data.url) // use the redirect API for your server framework
    }
}


export async function signInWithGithub() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${PUBLIC_URL}/auth/callback`,
        },
    })

    if (data.url) {
        redirect(data.url) // use the redirect API for your server framework
    }
}


export async function deleteAccount() {
    const supabase = await createAdminClient()

    // calling getSession() here because middleware runs getUser() before every action/route/page,
    // ensuring the session (and the user contained within) in the headers is up-to-date.
    const sessionResult = await supabase.auth.getSession()

    if (sessionResult.error) {
        const { name, status, message } = sessionResult.error
        redirect(`/settings?error=${name}&error_code=${status}&error_description=${message}`)
    }

    if (!sessionResult.data.session?.user) {
        redirect("/settings?error=Account+not+found.&error_code=404&error_description=Your+account+could+not+be+deleted+because+there+was+an+issue+finding+it+on+our+servers.+Please+try+again,+or+contact+an+administrator+if+the+issue+persists.")
    }

    const deletionResult = await supabase.auth.admin.deleteUser(sessionResult.data.session?.user.id)

    if (deletionResult.error) {
        const { name, status, message } = deletionResult.error
        redirect(`/settings?error=${name}&error_code=${status}&error_description=${message}`)
    }

    redirect("/?message=Your+account+has+been+successfully+deleted.&refresh_browser_auth")
}
