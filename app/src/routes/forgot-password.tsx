// AI: Forgot password page. Sends reset email via server function.
// Shows success message after submission (not a redirect).
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/submit-button'
import { forgotPasswordFn } from '@/server/auth'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const mutation = useMutation({
    mutationFn: (data: { email: string }) => forgotPasswordFn({ data }),
  })

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-57px)] bg-muted">
      <Card className="w-[350px] mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot your password?</CardTitle>
          <CardDescription>Enter your email address</CardDescription>
        </CardHeader>
        <CardContent>
          {mutation.data?.success ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Check your email for a password reset link.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                mutation.mutate({
                  email: formData.get('email') as string,
                })
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <SubmitButton pending={mutation.isPending}>
                Send reset link
              </SubmitButton>
              {mutation.data && !mutation.data.success && (
                <p className="text-sm text-destructive text-center py-2">
                  {mutation.data.message}
                </p>
              )}
            </form>
          )}
        </CardContent>
        <CardFooter className="flex-col text-center gap-2">
          <Link
            to="/signin"
            className="text-sm text-muted-foreground hover:underline"
          >
            Remember your password? Sign in
          </Link>
          <Link
            to="/signup"
            className="text-sm text-muted-foreground hover:underline"
          >
            Don&apos;t have an account? Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
