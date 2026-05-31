// AI: Reset password route. User lands here after clicking the email link.
// Will be rewritten with shadcn forms in Phase 4.
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Reset Password</h1>
      <p className="text-muted-foreground">Phase 4: shadcn form coming soon</p>
    </div>
  )
}
