"use client"

import { useState, KeyboardEvent } from "react";
import { useAppContext } from "@/lib/contexts/appContext";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

type Props = {
    initialValue?: string
}

const emailRegex = /^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/

export default function UpdateEmail({ initialValue }: Props) {
    const [email, setEmail] = useState(initialValue || "Edit your name")
    const [loading, setLoading] = useState(false)
    const [inputRef, setInputRef] = useState<null | HTMLElement>(null)
    const { supabase } = useAppContext()

    async function updateEmail() {
        if (emailRegex.test(email) && email !== initialValue) {
            setLoading(true)

            const emailResult = await supabase.auth.updateUser(
                { email },
                { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/settings` }
            )

            setLoading(false)
            
            if (emailResult.data.user) {
                localStorage.setItem("email_change", "true")
                toast("Please confirm both emails", {
                    description: "Confirmation emails have been sent to both your old and new email addresses. Please click the confirmation link in both of them."
                })
            } else if (emailResult.error) {
                toast("Error", {
                    description: emailResult.error.message
                })
            }
        }
    }

    function handleKeyUp(e: KeyboardEvent){
        if (e.key === "Escape") {
            inputRef?.blur()
        }

        if (e.key === "Enter") {
            inputRef?.blur()
            updateEmail()
        }
    }

    const canSubmit = emailRegex.test(email) && email !== initialValue

    return (
        <>
            <Input
                ref={setInputRef}
                type="email"
                placeholder="Edit your email address..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyUp={handleKeyUp}
            />
            <Button
                className="w-30 mt-2"
                variant={canSubmit ? "default" : "outline"}
                aria-disabled={!canSubmit || loading}
                disabled={!canSubmit || loading}
                onClick={updateEmail}
            >
                {loading ? <Loader2 className="animate-spin" /> : "Change Email"}
            </Button>
        </>
    )
}