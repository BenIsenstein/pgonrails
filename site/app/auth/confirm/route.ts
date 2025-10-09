import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EmailOtpType } from '@supabase/auth-js'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType
    const next = searchParams.get('next') ?? '/'

    if (token_hash && type) {
        const supabase = await createClient()
        const { error } = await supabase.auth.verifyOtp({ type, token_hash })
       
        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv || !forwardedHost) {
                return NextResponse.redirect(`${origin}${next}`)
            } else {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            }
        } else {
            return NextResponse.redirect(`${origin}?error=${error.name}&error_code=${error.status}&error_description=${error.message}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}?error=Error&error_description=Couldn't+finish+auth+confirmation+due+to+an+unknown+error.`)
}