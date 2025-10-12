"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAppContext } from "@/lib/contexts/appContext";

export default function UrlAuthSync() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { supabase, mergeState } = useAppContext()

    useEffect(() => {
        if (searchParams.has("refresh_browser_auth")) {
            supabase.auth.getSession().then(response => {
                router.replace(pathname)
                mergeState({ user: response.data.session?.user || null })
            })
        }
    }, [pathname, searchParams, router, mergeState, supabase.auth])

    return <></>
}