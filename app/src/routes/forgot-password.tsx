// AI: Forgot password route. Will be rewritten with shadcn forms in Phase 4.
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Forgot Password</h1>
      <p className="text-muted-foreground">Phase 4: shadcn form coming soon</p>
    </div>
  )
}
