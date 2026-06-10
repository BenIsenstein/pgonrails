// AI: Sign-in page. Card layout with email/password form.
// On success, invalidates router (refetches user) and navigates to redirect param or /dashboard.
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/submit-button'
import { signInFn } from '@/server/auth'

export const Route = createFileRoute('/signin')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) ?? undefined,
  }) as { redirect?: string },
  component: SignInPage,
})

function SignInPage() {
  const router = useRouter()
  const { redirect: redirectTo } = Route.useSearch()

  const mutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      signInFn({ data }),
    onSuccess: async (data) => {
      if (data.success) {
        await router.invalidate()
        router.navigate({ to: redirectTo || '/dashboard' })
      }
    },
  })

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-57px)] bg-muted">
      <Card className="w-[350px] mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              mutation.mutate({
                email: formData.get('email') as string,
                password: formData.get('password') as string,
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
            <div className="grid gap-2 mt-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                required
              />
            </div>
            <SubmitButton pending={mutation.isPending}>
              Sign in
            </SubmitButton>
            {mutation.data && !mutation.data.success && (
              <p className="text-sm text-destructive text-center py-2">
                {mutation.data.message}
              </p>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex-col text-center gap-2">
          <Link
            to="/forgot-password"
            className="text-sm text-muted-foreground hover:underline"
          >
            Forgot password?
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
