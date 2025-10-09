"use client"

import { useAppContext } from "@/lib/contexts/appContext";
import { Input } from "../ui/input";
import { useRef, useState, KeyboardEvent, FocusEvent } from "react";
import { toast } from "sonner";

type Props = {
    initialValue?: string
}

export default function UpdateDisplayName({ initialValue }: Props) {
    const [value, setValue] = useState(initialValue || "Edit your name")
    const [inputRef, setInputRef] = useState<null | HTMLElement>(null)
    const previousKeyPress = useRef("")
    const { supabase, user } = useAppContext()

    function handleKeyUp(e: KeyboardEvent){
        previousKeyPress.current = e.key
        
        if (e.key === "Enter" || e.key === "Escape") {
            inputRef?.blur()
        }
    }

    async function handleBlur(e: FocusEvent<HTMLInputElement, Element>) {
        if (previousKeyPress.current === "Escape") {
            return
        }

        if (e.target.value !== user?.user_metadata?.full_name) {
            const full_name = e.target.value

            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name,
                    first_name: full_name.split(" ")[0],
                    last_name: full_name.split(" ").reverse()[0]
                }
            })

            if (error) {
                setValue(user?.user_metadata?.full_name)
                toast("Error", {
                    description: error.message
                })
            }
        }
    }

    return (
        <Input
            ref={setInputRef}
            placeholder="Edit your display name..."
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyUp={handleKeyUp}
            onBlur={handleBlur}
        />
    )
}