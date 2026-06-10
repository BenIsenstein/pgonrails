// AI: Avatar upload component for settings page.
// Uses client-side Supabase to upload to Storage, then updates user_metadata
// so the avatar filename is persisted. Calls router.invalidate() after.
import { useState, type ChangeEvent } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Edit, UserRound } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getSupabaseBrowserClient } from '@/utils/supabase-browser'
import { toast } from 'sonner'
import type { AppUser } from '@/utils/types'

type Props = {
  user: AppUser
}

export function UploadAvatar({ user }: Props) {
  const router = useRouter()
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null)
  const supabase = getSupabaseBrowserClient()

  const avatarUrl = user.avatarImgName
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/render/image/public/avatars/${user.avatarImgName}?cb=${user.avatarImgCb}&width=176&height=176`
    : undefined

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const extension = file.name.split('.').pop()
    const cb = Date.now()

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(`${user.id}/profile.${extension}`, file, {
        upsert: true,
        metadata: { cb: String(cb) },
      })

    if (error) {
      toast.error(error.message)
      return
    }

    if (data) {
      // Update user_metadata so fetchUser picks up the new avatar
      await supabase.auth.updateUser({
        data: {
          avatar_img_name: data.path,
          avatar_img_cb: String(cb),
        },
      })
      await router.invalidate()
    }
  }

  return (
    <div className="relative">
      <Avatar className="w-44 h-44">
        <AvatarImage src={avatarUrl} alt={user.fullName || user.email} />
        <AvatarFallback>
          <div className="w-44 h-44 rounded-full flex justify-center items-center bg-muted">
            <UserRound className="h-24 w-24 text-muted-foreground" />
          </div>
        </AvatarFallback>
      </Avatar>
      <input
        ref={setInputRef}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={handleUpload}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="absolute bottom-2 left-0 bg-background w-8 h-8 rounded-md flex justify-center items-center cursor-pointer border shadow">
            <Edit className="h-4 w-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => inputRef?.click()}>
            Upload a photo...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
