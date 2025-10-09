import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { STORAGE_KEY } from './constants'

export async function updateSession(request: NextRequest) {
    const response = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                }
            },
            auth: {
                storageKey: STORAGE_KEY
            }
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // Running supabase.auth.getUser() will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs

    const userResult = await supabase.auth.getUser()
    
    // ** STRIPE webhook - for later. **
    // if (request.nextUrl.pathname.startsWith('/webhook')) {
    //     return response
    // }

    if (
        !userResult.data.user &&
        !request.nextUrl.pathname.startsWith('/signin') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/signup') &&
        !request.nextUrl.pathname.startsWith('/forgot-password') &&
        !request.nextUrl.pathname.startsWith('/error') &&
        !(request.nextUrl.pathname === '/')
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/signin'
        return NextResponse.redirect(url)
    }

    // ** If user is logged in, and the root url is only for non-authed, redirect to authed home **
    // if (user && request.nextUrl.pathname === '/') {
    //     const url = request.nextUrl.clone()
    //     url.pathname = '/dashboard'
    //     return NextResponse.redirect(url)
    // }
    
    // IMPORTANT: You *must* return the response object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return response
}