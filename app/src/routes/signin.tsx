// AI: Sign-in route. Will be rewritten with shadcn forms in Phase 4.
// Placeholder to keep the app compilable.
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signin')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) ?? undefined,
  }) as { redirect?: string },
  component: SignInPage,
})

function SignInPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <p className="text-muted-foreground">Phase 4: shadcn form coming soon</p>
    </div>
  )
}
