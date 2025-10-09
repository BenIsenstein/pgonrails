"use client"

import { ArrowLeft, ArrowRight, Cog, Filter, LogOut, MoreHorizontal, Trello, UserRound } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"
import { signout } from "@/app/auth/actions"
import { useAppContext } from "@/lib/contexts/appContext"
import { usePathname, useRouter } from "next/navigation"
import { Badge } from "./ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Props = {
    boardTitle?: string
    onEditBoard?: () => void
    onFilterClick?: () => void
    filterCount?: number
}

export default function Navbar({ boardTitle, onEditBoard, onFilterClick, filterCount }: Props) {
    const { user } = useAppContext()
    const pathname = usePathname()
    const router = useRouter()

    const isDashboard = pathname === "/dashboard"
    const isBoard = pathname.startsWith("/boards/")
    const [dropdownOpen, setDropdownOpen] = useState(false)
    
    if (isDashboard) {
        return (
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <Trello className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                        <span className="text-xl sm:text-2xl font-bold text-gray-900">Trello Clone</span>
                    </Link>
                    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <Avatar className={`w-8 h-8 cursor-pointer transition-shadow hover:ring-2 hover:ring-blue-600 ${dropdownOpen ? "ring-2 ring-blue-600" : ""}`}>
                                <AvatarImage
                                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/avatars/${user?.user_metadata?.avatar_img_name}?cb=${user?.user_metadata?.avatar_img_cb}&width=32&height=32`}
                                    alt={`Profile picture for ${user?.user_metadata?.full_name}`}
                                />
                                <AvatarFallback>
                                    <div className="w-8 h-8 rounded-full flex justify-center items-center space-x-2 sm:space-x-4 bg-blue-100">
                                        <UserRound className="h-5 w-5 text-blue-600 stroke-[2.5]" />
                                    </div>
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[calc(100vw_-_32px)] max-w-100" align="end">
                            <DropdownMenuLabel className="flex items-center gap-3">
                                <Avatar className="w-7 h-7">
                                    <AvatarImage
                                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/avatars/${user?.user_metadata?.avatar_img_name}?cb=${user?.user_metadata?.avatar_img_cb}&width=28&height=28`}
                                        alt={`Profile picture for ${user?.user_metadata?.full_name}`}
                                    />
                                    <AvatarFallback>
                                        <div className="w-7 h-7 rounded-full flex justify-center items-center space-x-2 sm:space-x-4 bg-blue-100 cursor-pointer">
                                            <UserRound className="h-4 w-4 text-blue-600 stroke-[2.5]" />
                                        </div>
                                    </AvatarFallback>
                                </Avatar>
                                {user?.user_metadata?.full_name || user?.email}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push("/settings")}>
                                <Cog className="ml-1.5 mr-2.5" />
                                Manage account
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={signout}>
                                <LogOut className="ml-1.5 mr-2.5" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
        )
    }

    if (isBoard) {
        return (
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                            <Link
                                href="/dashboard"
                                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 flex-shrink-0"
                            >
                                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="hidden sm:inline">Back to dashboard</span>
                                <span className="sm:hidden">Back</span>
                            </Link>
                            <div className="h-4 sm:h-6 w-px bg-gray-300 hidden sm:block" />
                            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                                <Trello className="text-blue-600" />
                                <div className="items-center space-x-1 sm:space-x-2 min-w-0">
                                    <span className="text-lg font-bold text-gray-900 truncate">
                                        {boardTitle}
                                    </span>
                                    {onEditBoard && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 flex-shrink-0 p-0"
                                            onClick={onEditBoard}
                                        >
                                            <MoreHorizontal />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center flex-shrink-0 space-x-2 sm:space-x-4">
                            {onFilterClick && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`text-xs sm:text-sm ${filterCount ? "bg-blue-100 border-blue-200" : ""}`}
                                    onClick={onFilterClick}
                                >
                                    <Filter className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Filter</span>
                                    {filterCount && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs ml-1 sm:ml-2 bg-blue-100 border-blue-200"
                                        >
                                            {filterCount}
                                        </Badge>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        )
    }

    return (
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <Trello className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">Trello Clone</span>
                </Link>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {user && (
                        <div className="flex items-center space-x-4 md:space-x-8">
                            <Link href="/dashboard">
                                <Button size="sm" className="text-xs sm:text-sm cursor-pointer">
                                    Dashboard <ArrowRight />
                                </Button>
                            </Link>
                            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className={`w-8 h-8 cursor-pointer transition-shadow hover:ring-2 hover:ring-blue-600 ${dropdownOpen ? "ring-2 ring-blue-600" : ""}`}>
                                        <AvatarImage
                                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/avatars/${user?.user_metadata?.avatar_img_name}?cb=${user?.user_metadata?.avatar_img_cb}&width=32&height=32`}
                                            alt={`Profile picture for ${user?.user_metadata?.full_name}`}
                                        />
                                        <AvatarFallback>
                                            <div className="w-8 h-8 rounded-full flex justify-center items-center bg-blue-100">
                                                <UserRound className="h-5 w-5 text-blue-600 stroke-[2.5]" />
                                            </div>
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[calc(100vw_-_32px)] max-w-100" align="end">
                                    <DropdownMenuLabel className="flex items-center gap-3">
                                        <Avatar className="w-7 h-7">
                                            <AvatarImage
                                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/avatars/${user?.user_metadata?.avatar_img_name}?cb=${user?.user_metadata?.avatar_img_cb}&width=28&height=28`}
                                                alt={`Profile picture for ${user?.user_metadata?.full_name}`}
                                            />
                                            <AvatarFallback>
                                                <div className="w-7 h-7 rounded-full flex justify-center items-center space-x-2 sm:space-x-4 bg-blue-100 cursor-pointer">
                                                    <UserRound className="h-4 w-4 text-blue-600 stroke-[2.5]" />
                                                </div>
                                            </AvatarFallback>
                                        </Avatar>
                                        {user?.user_metadata?.full_name || user?.email}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push("/settings")}>
                                        <Cog className="ml-1.5 mr-2.5" />
                                        Manage account
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={signout}>
                                        <LogOut className="ml-1.5 mr-2.5" />
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                    {!user && (
                        <div className="space-x-2">
                            <Link href="/signin">
                                <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="text-xs sm:text-sm">
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}