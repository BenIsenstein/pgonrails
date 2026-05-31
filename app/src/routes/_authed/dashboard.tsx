import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Welcome to your app.</p>
    </div>
  )
}
