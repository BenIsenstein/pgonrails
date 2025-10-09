"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionState } from 'react'
import { forgotPassword } from '@/app/auth/actions'
import SubmitButton from "./FormSubmitButton"

export default function ForgotPasswordForm() {
    const [formState, formAction] = useActionState(forgotPassword, {
        message: ''
    })
    
    return (
        <form action={formAction}>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="johndoe@example.com"
                    required
                />
            </div>
            <SubmitButton>
                Send email
            </SubmitButton>
            {formState?.message && (
                <p className="text-sm text-red-500 text-center py-2">{formState.message}</p>
            )}
        </form >
    )
}