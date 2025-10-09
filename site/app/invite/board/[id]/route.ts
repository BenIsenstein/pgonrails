import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { origin } = new URL(request.url)
    const { id: boardId } = await params

    // calling getSession() here because middleware runs getUser() before every action/route/page,
    // ensuring the session (and the user contained within) in the headers is up-to-date.
    const supabase = await createClient()
    const sessionResult = await supabase.auth.getSession()

    if (sessionResult.error) {
        const { name, status, message } = sessionResult.error
        return NextResponse.redirect(`/signin?error=${name}&error_code=${status}&error_description=${message}`)
    }

    if (!sessionResult.data.session?.user) {
        return NextResponse.redirect("/settings?error=Account+not+found.&error_code=404&error_description=We+had+trouble+finding+your+account+on+our+servers.+Please+try+again,+or+contact+an+administrator+if+the+issue+persists.")
    }

    if (!boardId) {
        return NextResponse.redirect(`${origin}?error=Error&error_description=Couldn't+join+board+due+to+an+unknown+error.`)
    }
    
    const { error } = await supabase
        .from("users_boards")
        .insert({
            user_id: sessionResult.data.session.user.id,
            board_id: boardId
        })
    
    if (error) {
        return NextResponse.redirect(`${origin}?error=${error.hint}&error_code=${error.code}&error_description=${error.details}`)
    }

    const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv || !forwardedHost) {
        return NextResponse.redirect(`${origin}/boards/${boardId}?Message=You+have+successfully+joined+the+board.`)
    } else {
        return NextResponse.redirect(`https://${forwardedHost}/boards/${boardId}?Message=You+have+successfully+joined+the+board.`)
    }
}