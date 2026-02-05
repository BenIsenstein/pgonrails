"use client"

import { Edit, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChangeEvent, useState } from "react";
import { useAppContext } from "@/lib/contexts/appContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UploadAvatar() {
    const [inputRef, setInputRef] = useState<null | HTMLElement>(null)
    const { supabase, user, mergeState } = useAppContext()

    async function handleUploadAvatar(e: ChangeEvent<HTMLInputElement>) {
        if (!user) return
        if (!e.target.files?.[0]) return

        const avatarFile = e.target.files[0]
        const extension = avatarFile.name.split('.').reverse()[0]
        const cb = Date.now() // cachebuster query param to refetch the image in the user's browser right away

        const { data, error } = await supabase
            .storage
            .from('avatars')
            .upload(`${user.id}/profile.${extension}`, avatarFile, {
                upsert: true,
                metadata: { cb }
            })

        if (error) throw error

        if (data) {
            mergeState({
                user: {
                    ...user,
                    user_metadata: {
                        ...user.user_metadata,
                        avatar_img_name: data.path,
                        avatar_img_cb: cb
                    }
                }
            })
        }
    }

    return (
        <>
            <Avatar className="w-44 h-44">
                <AvatarImage
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/avatars/${user?.user_metadata?.avatar_img_name}?cb=${user?.user_metadata?.avatar_img_cb}&width=176&height=176`}
                    alt={`Profile picture for ${user?.user_metadata?.full_name}`}
                />
                <AvatarFallback>
                    <div className={`w-44 h-44 rounded-full flex justify-center items-center bg-blue-100`}>
                        <UserRound className="h-30 w-30 text-blue-600 stroke-2" />
                    </div>
                </AvatarFallback>
            </Avatar>
            <input
                ref={setInputRef}
                className="hidden"
                type="file"
                accept="image/*"
                onChange={handleUploadAvatar}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className={`absolute bottom-8 bg-white w-8 h-8 rounded-md flex justify-center items-center cursor-pointer border shadow`}>
                        <Edit className="h-4 w-4 stroke-[2.5]" />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="start">
                    <DropdownMenuItem onClick={() => inputRef?.click()}>
                        Upload a photo...
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}