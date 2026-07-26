// AI: Landing page. Minimal hero with CTA buttons.
// Shows "Go to Dashboard" if already signed in, otherwise Sign In / Sign Up.
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { user } = Route.useRouteContext()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-4">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Your SaaS Starts Here
        </h1>
        <p className="text-lg text-muted-foreground">
          A production-ready template with authentication, avatars, dark mode,
          and everything you need to ship fast.
        </p>
        <div className="flex items-center justify-center gap-4">
          {user ? (
            <Button size="lg" asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
