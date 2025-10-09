"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionState } from 'react'
import { resetPassword } from '@/app/auth/actions'
import SubmitButton from "./FormSubmitButton"

export default function ResetPasswordForm() {
    const [formState, formAction] = useActionState(resetPassword, {
        message: ''
    })

    return (
        <form action={formAction}>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Enter New Password"
                    name="password"
                    required
                />
                <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Confirm Password"
                    name="confirm_password"
                    required
                />
            </div>
            <SubmitButton>
                Reset password  
            </SubmitButton>
            {formState?.message && (
                <p className="text-sm text-red-500 text-center py-2">{formState.message}</p>
            )}
        </form >
    )
}