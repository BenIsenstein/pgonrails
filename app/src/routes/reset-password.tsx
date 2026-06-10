// AI: Reset password page. User arrives here from the email reset link.
// Supabase establishes a session via the link's token before this page loads.
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/submit-button'
import { resetPasswordFn } from '@/server/auth'
import { toast } from 'sonner'
import { useState } from 'react'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const router = useRouter()
  const [confirmError, setConfirmError] = useState('')

  const mutation = useMutation({
    mutationFn: (data: { password: string }) => resetPasswordFn({ data }),
    onSuccess: async (data) => {
      if (data.success) {
        toast.success('Password updated successfully')
        await router.invalidate()
        router.navigate({ to: '/signin' })
      }
    },
  })

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-57px)] bg-muted">
      <Card className="w-[350px] mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setConfirmError('')
              const formData = new FormData(e.currentTarget)
              const password = formData.get('password') as string
              const confirm = formData.get('confirm_password') as string

              if (password !== confirm) {
                setConfirmError('Passwords do not match')
                return
              }

              mutation.mutate({ password })
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="grid gap-2 mt-4">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input
                id="confirm_password"
                type="password"
                name="confirm_password"
                placeholder="Confirm new password"
                required
              />
            </div>
            <SubmitButton pending={mutation.isPending}>
              Reset password
            </SubmitButton>
            {confirmError && (
              <p className="text-sm text-destructive text-center py-2">
                {confirmError}
              </p>
            )}
            {mutation.data && !mutation.data.success && (
              <p className="text-sm text-destructive text-center py-2">
                {mutation.data.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
