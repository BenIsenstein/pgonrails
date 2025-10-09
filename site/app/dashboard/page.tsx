"use client"

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/lib/contexts/appContext";
import { useBoards } from "@/lib/hooks/useBoards";
import { Badge } from "@/components/ui/badge";
import { Filter, Grid3X3, List, Loader2, Plus, Rocket, Search, Trello } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMergeState } from "@/lib/hooks/useMergeState";
import { Label } from "@/components/ui/label";

const DEFAULT_FILTERS = {
    search: "",
    dateRange: {
        start: null as string | null,
        end: null as string | null,
    },
    taskCount: {
        min: null as number | null,
        max: null as number | null,
    },
}

export default function DashboardPage() {
    const { user } = useAppContext()
    const { createBoard, boards, loading, error } = useBoards()
    const [state, mergeState] = useMergeState({
        viewMode: "grid" as "grid" | "list",
        isFilterOpen: false,
        filters: DEFAULT_FILTERS,
        newFilters: DEFAULT_FILTERS,
    })


    const handleCreateBoard = async () => {
        await createBoard({
            title: "New Board",
            description: "A new board for your projects.",
        })
    }

    const filteredBoards = boards.filter(board => {
        const matchesSearch = board.title.toLowerCase().includes(state.filters.search.toLowerCase())

        if (!matchesSearch) {
            return false
        }

        let matchesDateRange: boolean

        if (!state.filters.dateRange.start && !state.filters.dateRange.end) {
            matchesDateRange = true
        } else if (state.filters.dateRange.start && state.filters.dateRange.end) {
            matchesDateRange = (
                new Date(board.updated_at) >= new Date(state.filters.dateRange.start) &&
                new Date(board.updated_at) <= new Date(state.filters.dateRange.end)
            )
        } else if (state.filters.dateRange.start) {
            matchesDateRange = new Date(board.updated_at) >= new Date(state.filters.dateRange.start)
        } else {
            matchesDateRange = new Date(board.updated_at) <= new Date(state.filters.dateRange.end!)
        }

        if (!matchesDateRange) {
            return false
        }

        let matchesTaskCount: boolean

        if (!state.filters.taskCount.min && !state.filters.taskCount.max) {
            matchesTaskCount = true
        } else if (state.filters.taskCount.min && state.filters.taskCount.max) {
            matchesTaskCount = (
                board.tasks.length >= state.filters.taskCount.min &&
                board.tasks.length <= state.filters.taskCount.max
            )
        } else if (state.filters.taskCount.min) {
            matchesTaskCount = board.tasks.length >= state.filters.taskCount.min
        } else {
            matchesTaskCount = board.tasks.length <= state.filters.taskCount.max!
        }

        if (!matchesTaskCount) {
            return false
        }

        return true
    })

    if (loading) {
        return (
            <div>
                <Loader2 className="animate-spin" />
                <span>Loading your boards...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div>
                <h2>Error loading your boards</h2>
                <br />
                <p className="text-gray-600">{error}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-6 sm:py-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.user_metadata?.first_name || user?.email}! 👋
                    </h1>
                    <p className="text-gray-600">
                        {"Here's what's happening with your boards today."}
                    </p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                                        Total Boards
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {boards.length}
                                    </p>
                                </div>
                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Trello className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600">
                                Active Projects
                            </p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                {boards.length}
                            </p>
                            </div>
                            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                                        Recent Activity
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {
                                            boards.filter(board => {
                                                const updatedAt = new Date(board.updated_at)
                                                const oneWeekAgo = new Date()
                                                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                                                return updatedAt > oneWeekAgo
                                            }).length
                                        }
                                    </p>
                                </div>
                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    📊
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                                        Total Boards
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {boards.length}
                                    </p>
                                </div>
                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Trello className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Your Boards
                            </h2>
                            <p className="text-gray-600">
                                Manage your projects and tasks
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="flex items-center space-x-2 rounded-md bg-white border p-1">
                                <Button
                                    variant={state.viewMode == "grid" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => mergeState({ viewMode: "grid" })}
                                >
                                    <Grid3X3 />
                                </Button>
                                <Button
                                    variant={state.viewMode == "list" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => mergeState({ viewMode: "list" })}
                                >
                                    <List />
                                </Button>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => mergeState({ isFilterOpen: true })}
                            >
                                <Filter />
                                Filter
                            </Button>

                            <Button onClick={handleCreateBoard}>
                                <Plus />
                                Create Board
                            </Button>
                        </div>
                    </div>

                    <div className="relative mb-4 sm:mb-6">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                        />
                        <Input
                            id="search"
                            placeholder="Search boards..."
                            className="pl-10"
                            value={state.filters.search}
                            onChange={e => mergeState(prev => ({
                                filters: {
                                    ...prev.filters,
                                    search: e.target.value
                                },
                                newFilters: {
                                    ...prev.newFilters,
                                    search: e.target.value
                                },
                            }))}
                        />
                    </div>

                    {!boards.length && <div>No boards yet</div>}

                    {boards.length && (
                        state.viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                {filteredBoards.map(board => (
                                    <Link href={`/boards/${board.id}`} key={board.id}>
                                        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <div className={`w-4 h-4 ${board.color} rounded`} />
                                                    <Badge className="text-xs" variant="secondary">
                                                        New
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 sm:p-6">
                                                <CardTitle className={`text-base sm:text-lg mb-2 group-hover:${board.color.replace("bg", "text")} transition-colors`}>
                                                    {board.title}
                                                </CardTitle>
                                                <CardDescription className="text-sm mb-4">
                                                    {board.description}
                                                </CardDescription>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-1 sm:space-y-0">
                                                    <span>
                                                        Created{" "}
                                                        {new Date(board.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span>
                                                        Updated{" "}
                                                        {new Date(board.updated_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}

                                <Card
                                    onClick={handleCreateBoard}
                                    className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group"
                                >
                                    <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                                        <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                                        <p className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium">
                                            Create new board
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div>
                                {boards.map((board, idx) => (
                                    <div key={board.id} className={idx > 0 ? "mt-4" : ""}>
                                        <Link href={`/boards/${board.id}`}>
                                            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className={`w-4 h-4 ${board.color} rounded`} />
                                                        <Badge className="text-xs" variant="secondary">
                                                            New
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-4 sm:p-6">
                                                    <CardTitle className={`text-base sm:text-lg mb-2 group-hover:${board.color.replace("bg", "text")} transition-colors`}>
                                                        {board.title}
                                                    </CardTitle>
                                                    <CardDescription className="text-sm mb-4">
                                                        {board.description}
                                                    </CardDescription>
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-1 sm:space-y-0">
                                                        <span>
                                                            Created{" "}
                                                            {new Date(board.created_at).toLocaleDateString()}
                                                        </span>
                                                        <span>
                                                            Updated{" "}
                                                            {new Date(board.updated_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </div>
                                ))}

                                <Card className="mt-4 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group">
                                    <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                                        <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                                        <p className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium">
                                            Create new board
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )
                    )}
                </div>
            </main>
            <Dialog
                open={state.isFilterOpen}
                onOpenChange={bool => mergeState({
                    isFilterOpen: bool,
                    newFilters: state.filters
                })}
            >
                <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Filter Boards
                        </DialogTitle>
                        <p className="text-sm text-gray-600">
                            Filter boards by title, date, or task count
                        </p>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Search</Label>
                            <Input
                                id="search"
                                placeholder="Search board titles..."
                                value={state.newFilters.search}
                                onChange={e => mergeState(prev => ({
                                    newFilters: {
                                        ...prev.newFilters,
                                        search: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Date Range</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">Start Date</Label>
                                    <Input
                                        type="date"
                                        value={state.newFilters.dateRange.start || ""}
                                        onChange={e => mergeState(prev => ({
                                            newFilters: {
                                                ...prev.newFilters,
                                                dateRange: {
                                                    ...prev.newFilters.dateRange,
                                                    start: e.target.value || null
                                                }
                                            }
                                        }))}
                                    />
                                </div>
                                <div> 
                                    <Label className="text-xs">End Date</Label>
                                    <Input
                                        type="date"
                                        value={state.newFilters.dateRange.end || ""}
                                        onChange={e => mergeState(prev => ({
                                            newFilters: {
                                                ...prev.newFilters,
                                                dateRange: {
                                                    ...prev.newFilters.dateRange,
                                                    end: e.target.value || null
                                                }
                                            }
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Task Count</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">Minimum</Label>
                                    <Input
                                        id="minTaskCount"
                                        type="number"
                                        min="0"
                                        placeholder="Min tasks"
                                        value={state.newFilters.taskCount.min || 0}
                                        onChange={e => mergeState(prev => ({
                                            newFilters: {
                                                ...prev.newFilters,
                                                taskCount: {
                                                    ...prev.newFilters.taskCount,
                                                    min: e.target.value ? Number(e.target.value) : null
                                                }
                                            }
                                        }))}
                                    />
                                </div>
                                <div> 
                                    <Label className="text-xs">Maximum</Label>
                                    <Input
                                        id="maxTaskCount"
                                        type="number"
                                        min="0"
                                        placeholder="Max tasks"
                                        value={state.newFilters.taskCount.max || 0}
                                        onChange={e => mergeState(prev => ({
                                            newFilters: {
                                                ...prev.newFilters,
                                                taskCount: {
                                                    ...prev.newFilters.taskCount,
                                                    max: e.target.value ? Number(e.target.value) : null
                                                }
                                            }
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between pt-4 space-y-2 sm:space-y-0 sm:space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => mergeState({
                                    isFilterOpen: false,
                                    filters: DEFAULT_FILTERS,
                                    newFilters: DEFAULT_FILTERS,
                                })}
                            >
                                Clear Filters
                            </Button>
                            <Button
                                onClick={() => mergeState({
                                    isFilterOpen: false,
                                    filters: state.newFilters,
                                })}
                            >
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}