"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export default function UrlToast() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        if (searchParams.has("message")) {
            const newParams = new URLSearchParams(searchParams)
            newParams.delete("message")
            const queryString = newParams.toString()
            router.replace(queryString ? `${pathname}?${queryString}` : pathname)
            toast("Message", {
                description: searchParams.get("message")
            })
        }

        if (searchParams.has("error")) {
            const newParams = new URLSearchParams(searchParams)
            newParams.delete("error")
            newParams.delete("error_code")
            newParams.delete("error_description")
            const queryString = newParams.toString()
            router.replace(queryString ? `${pathname}?${queryString}` : pathname)
            toast("Error", {
                description: (
                <div className="space-y-1">
                    <div>{searchParams.get("error")}</div>

                    {searchParams.has("error_code") && (
                    <div>{searchParams.get("error_code")}</div>
                    )}

                    {searchParams.has("error_description") && (
                    <>
                        <hr className="mt-2 mb-2" />
                        <div >{searchParams.get("error_description")}</div>
                    </>
                    )}
                </div>
                )
            })
            router.replace(pathname)
        }
    }, [pathname, searchParams, router])

    return <></>
}