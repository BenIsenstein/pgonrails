"use client"

import { useAppContext } from "@/lib/contexts/appContext"

export default function LiveDisplayName({ initialValue }: { initialValue: string }) {
    const { user } = useAppContext()

    return user?.user_metadata?.full_name || initialValue
}