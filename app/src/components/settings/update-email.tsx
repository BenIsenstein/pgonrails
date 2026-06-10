// AI: Update email component. Input + "Change Email" button.
// Uses client-side Supabase. Requires confirmation from both old and new email.
import { useState, type KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/utils/supabase-browser'
import { toast } from 'sonner'

type Props = {
  initialValue: string
}

const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/

export function UpdateEmail({ initialValue }: Props) {
  const [email, setEmail] = useState(initialValue)
  const [loading, setLoading] = useState(false)
  const supabase = getSupabaseBrowserClient()

  async function updateEmail() {
    if (!emailRegex.test(email) || email === initialValue) return

    setLoading(true)
    const { data, error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: `${window.location.origin}/settings` },
    )
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else if (data.user) {
      toast.info('Confirmation emails sent to both your old and new email addresses.')
    }
  }

  function handleKeyUp(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
      updateEmail()
    }
  }

  const canSubmit = emailRegex.test(email) && email !== initialValue

  return (
    <div className="space-y-2">
      <Input
        type="email"
        placeholder="Edit your email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyUp={handleKeyUp}
      />
      <Button
        variant={canSubmit ? 'default' : 'outline'}
        disabled={!canSubmit || loading}
        onClick={updateEmail}
      >
        {loading ? <Loader2 className="animate-spin" /> : 'Change Email'}
      </Button>
    </div>
  )
}
