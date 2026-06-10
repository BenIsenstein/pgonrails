// AI: Sign-up page. Collects name + email + password.
// On success, invalidates router and navigates to /dashboard.
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/submit-button'
import { signUpFn } from '@/server/auth'

export const Route = createFileRoute('/signup')({
  component: SignUpPage,
})

function SignUpPage() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: { fullName: string; email: string; password: string }) =>
      signUpFn({ data }),
    onSuccess: async (data) => {
      if (data.success) {
        await router.invalidate()
        router.navigate({ to: '/dashboard' })
      }
    },
  })

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-57px)] bg-muted">
      <Card className="w-[350px] mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign up</CardTitle>
          <CardDescription>Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              mutation.mutate({
                fullName: formData.get('name') as string,
                email: formData.get('email') as string,
                password: formData.get('password') as string,
              })
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                name="name"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid gap-2 mt-4">
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
              Sign up
            </SubmitButton>
            {mutation.data && !mutation.data.success && (
              <p className="text-sm text-destructive text-center py-2">
                {mutation.data.message}
              </p>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex-col text-center">
          <Link
            to="/signin"
            className="text-sm text-muted-foreground hover:underline"
          >
            Have an account? Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
