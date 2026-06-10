import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] p-4 gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <div className="text-muted-foreground">
        {children || <p>The page you are looking for does not exist.</p>}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
      </div>
    </div>
  )
}
