// AI: Sign-up route. Will be rewritten with shadcn forms in Phase 4.
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signup')({
  component: SignUpPage,
})

function SignUpPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <p className="text-muted-foreground">Phase 4: shadcn form coming soon</p>
    </div>
  )
}
