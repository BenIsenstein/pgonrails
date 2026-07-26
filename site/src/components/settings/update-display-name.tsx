// AI: Update display name component. Blur-to-save pattern.
// Uses client-side Supabase to update user_metadata, then invalidates router.
import { useState, useRef, type KeyboardEvent, type FocusEvent } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { getSupabaseBrowserClient } from '@/utils/supabase-browser'
import { toast } from 'sonner'

type Props = {
  initialValue: string
}

export function UpdateDisplayName({ initialValue }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue || '')
  const previousKey = useRef('')
  const supabase = getSupabaseBrowserClient()

  function handleKeyUp(e: KeyboardEvent<HTMLInputElement>) {
    previousKey.current = e.key
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.currentTarget.blur()
    }
  }

  async function handleBlur(e: FocusEvent<HTMLInputElement>) {
    if (previousKey.current === 'Escape') {
      setValue(initialValue)
      return
    }

    const newName = e.target.value.trim()
    if (newName && newName !== initialValue) {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: newName,
          first_name: newName.split(' ')[0],
          last_name: newName.split(' ').slice(1).join(' ') || newName.split(' ')[0],
        },
      })

      if (error) {
        setValue(initialValue)
        toast.error(error.message)
      } else {
        await router.invalidate()
      }
    }
  }

  return (
    <Input
      placeholder="Edit your display name..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyUp={handleKeyUp}
      onBlur={handleBlur}
    />
  )
}
