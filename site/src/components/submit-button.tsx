// AI: Shared submit button with loading spinner for auth forms.
// Mirrors the /site FormSubmitButton pattern using shadcn Button + Loader2.
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

type Props = {
  children: React.ReactNode
  pending?: boolean
  className?: string
}

export function SubmitButton({ children, pending, className }: Props) {
  return (
    <Button
      className={className ?? 'w-full mt-6'}
      type="submit"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? <Loader2 className="animate-spin" /> : children}
    </Button>
  )
}
