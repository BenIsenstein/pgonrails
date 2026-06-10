import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = Route.useRouteContext()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">
        Welcome{user.fullName ? `, ${user.fullName}` : ''}
      </h1>
      <p className="text-muted-foreground mt-2">
        This is your dashboard. Build your product here.
      </p>
    </div>
  )
}
