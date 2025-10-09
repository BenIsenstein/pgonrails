"use client"

import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBoard } from "@/lib/hooks/useBoards";
import { useMergeState } from "@/lib/hooks/useMergeState";
import { BoardUser, ColumnWithTasks, type Task } from "@/lib/supabase/models";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, rectIntersection, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Calendar, MoreHorizontal, Plus, User, UserRound } from "lucide-react";
import { useParams } from "next/navigation";
import { CSS } from "@dnd-kit/utilities"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect } from "react";
import { useAppContext } from "@/lib/contexts/appContext";
import { AvatarStack } from "@/components/AvatarStack";

type ColumnProps = {
    column: ColumnWithTasks
    children: React.ReactNode
    onCreateTask: (task) => Promise<void>
    onEditColumn: (column: ColumnWithTasks) => void
}

const PRIORITY_COLORS = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-red-500"
}

const DEFAULT_FILTERS = {
    priority: {
        low: false,
        medium: false,
        high: false,
        all: true
    },
    assignee: { all: true } as Record<string, boolean>,
    dueDate: null as string | null,
}

function DroppableColumn({
    column,
    children,
    onCreateTask,
    onEditColumn
}: ColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id: column.id })

    return (
        <div
            ref={setNodeRef}
            className={`w-full lg:flex-shrink-0 lg:w-80 ${isOver ? "bg-blue-50 rounded-lg" : ""}`}
        >
            <div className={`bg-white rounded-lg shadow-sm border ${isOver ? "ring-2 ring-blue-300" : ""}`}>
                <div className="p-3 sm:p-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                {column.title}
                            </h3>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                                {column.tasks.length}
                            </Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={() => onEditColumn(column)}>
                            <MoreHorizontal />
                        </Button>
                    </div>
                </div>

                <div className="p-2">
                    {children}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-700">
                                <Plus />
                                Add Task
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    Create New Task
                                </DialogTitle>
                                <p className="text-sm text-gray-600">
                                    Add a task to the board
                                </p>
                            </DialogHeader>
                            <form className="space-y-4" onSubmit={onCreateTask}>
                                <div className="space-y-2">
                                    <Label>Title *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="Enter task title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Enter task description"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Assignee</Label>
                                    <Input
                                        id="assignee"
                                        name="assignee"
                                        placeholder="Assign this task to someone"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select name="priority" defaultValue="medium">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["low", "medium", "high"].map((priority) => (
                                                <SelectItem key={priority} value={priority}>
                                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input type="date" id="dueDate" name="dueDate" />
                                </div>
                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button type="submit">Create Task</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

function SortableTask({ task, }: { task: Task }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id })

    const priorityColor = PRIORITY_COLORS[task.priority] || "bg-yellow-500"

    const styles = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    }

    return (
        <div ref={setNodeRef} {...listeners} {...attributes} className="last:mb-2" style={styles}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4">
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-start justify-between">
                            <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0 pr-2">
                                {task.title}
                            </h4>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                            {task.description || " "}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                                {task.assignee && (
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <User className="h-3 w-3" />
                                        <span className="truncate">{task.assignee}</span>
                                    </div>
                                )}
                                {task.due_date && (
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <Calendar className="h-3 w-3" />
                                        <span className="truncate">{task.due_date}</span>
                                    </div>
                                )}
                            </div>
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColor}`} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function TaskOverlay({ task, }: { task: Task }) {
    const priorityColor = PRIORITY_COLORS[task.priority] || "bg-yellow-500"

    return (
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
                <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start justify-between">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0 pr-2">{task.title}</h4>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                        {task.description || " "}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                            {task.assignee && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <User className="h-3 w-3" />
                                    <span className="truncate">{task.assignee}</span>
                                </div>
                            )}
                            {task.due_date && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    <span className="truncate">{task.due_date}</span>
                                </div>
                            )}
                        </div>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColor}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function BoardPage() {
    const { id } = useParams<{ id: string }>()
    const { supabase, user } = useAppContext()

    const {
        board,
        columns,
        users,
        updateBoard,
        createRealTask,
        moveTask,
        createColumn,
        updateColumn,
        mergeState: mergeBoardState,
    } = useBoard(id)

    const [state, mergeState] = useMergeState({
        isEditingTitle: false,
        isCreatingColumn: false,
        isEditingColumn: false,
        editingColumn: null as ColumnWithTasks | null,
        newColumnTitle: "",
        newTitle: "",
        newColor: "",
        isFilterOpen: false,
        filters: DEFAULT_FILTERS,
        newFilters: DEFAULT_FILTERS,
        activeTask: null as Task | null,
        liveUsers: {} as Record<string, BoardUser>
    })
    
    useEffect(() => {
        if (!id || !user?.user_metadata?.full_name || !user?.id) {
            return
        }

        console.log("running REALTIME CHANNEL EFFECT")
        const room = supabase.channel(`board:${id}`,{
            config: {
                presence: { key: user.id }
            }
        })

        room.on('presence', { event: 'sync' }, () => {
            console.log('Presence sync')
            const newState = room.presenceState<BoardUser>()
            const liveUsers: Record<string, BoardUser> = {}

            for (const key in newState) {
                liveUsers[key] = newState[key][0]
            }

            mergeState({ liveUsers })
        })

        room.subscribe(async (status) => {
            console.log('Subscription status', status)
            if (status !== 'SUBSCRIBED') {
                return
            }

            await room.track({
                full_name: user.user_metadata.full_name,
                avatar_img_name: user.user_metadata.avatar_img_name,
                avatar_img_cb: user.user_metadata.avatar_img_cb,
            })
        })

        return () => {
            supabase.removeChannel(room)
        }
    }, [
        id,
        mergeState,
        supabase,
        user?.id,
        user?.user_metadata?.full_name,
        user?.user_metadata?.avatar_img_name,
        user?.user_metadata?.avatar_img_cb
    ])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        })
    )

    async function handleUpdateBoard(e: React.FormEvent) {
        e.preventDefault()

        if (!state.newTitle.trim() || !board) return

        try {
            await updateBoard({
                title: state.newTitle,
                color: state.newColor || board.color
            })

            mergeState({ isEditingTitle: false })
        } catch {

        }
    }

    async function createTask(taskData: {
        title: string
        description?: string
        assignee?: string
        dueDate?: string
        priority: "low" | "medium" | "high"
    }) {
        const targetColumn = columns[0]

        if (!targetColumn) {
            throw new Error("No column available to add task")
        }

        try {
            await createRealTask(targetColumn.id, taskData)
        } catch {

        }
    }

    async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const taskData = {
            title: formData.get("title") as string,
            description: (formData.get("description") as string) || undefined,
            assignee: (formData.get("assignee") as string) || undefined,
            dueDate: (formData.get("dueDate") as string) || undefined,
            priority: (formData.get("priority") as "low" | "medium" | "high") || "medium"
        }

        if (taskData.title.trim()) {
            await createTask(taskData)

            const trigger = document.querySelector('[data-state="open"]') as HTMLElement
            trigger?.click()
        }
    }

    function handleDragStart(event: DragStartEvent) {
        const taskId = event.active.id
        const activeTask = columns
            .flatMap((col) => col.tasks)
            .find(task => task.id === taskId)

        if (activeTask) {
            mergeState({ activeTask })
        }
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event

        if (!over) return

        const activeId = active.id
        const overId = over.id

        const sourceColumn = columns.find(col =>
            col.tasks.some(task => task.id === activeId)
        )

        const targetColumn = columns.find(col =>
            col.tasks.some(task => task.id === overId)
        )

        if (!sourceColumn || !targetColumn) return

        if (sourceColumn.id === targetColumn.id) {
            const activeIndex = sourceColumn.tasks.findIndex(task => task.id === activeId)
            const overIndex = targetColumn.tasks.findIndex(task => task.id === overId)

            if (activeIndex !== overIndex) {
                mergeBoardState(prev => {
                    const newColumns = [...prev.columns]
                    const column = newColumns.find(col => col.id === sourceColumn.id)

                    if (column) {
                        const tasks = [...column.tasks]
                        const [removed] = tasks.splice(activeIndex, 1)
                        tasks.splice(overIndex, 0, removed)
                        column.tasks = tasks
                    }

                    return { columns: newColumns }
                })
            }
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (!over) return

        const taskId = active.id as string
        const overId = over.id

        const targetColumn = columns.find(col => col.id === overId)

        if (targetColumn) {
            const sourceColumn = columns.find(col =>
                col.tasks.some(task => task.id === taskId)
            )

            if (sourceColumn && sourceColumn.id !== targetColumn.id) {
                await moveTask(taskId, targetColumn.id, targetColumn.tasks.length)
            }
        } else {
            const sourceColumn = columns.find(col =>
                col.tasks.some(task => task.id === taskId)
            )

            const targetColumn = columns.find(col =>
                col.tasks.some(task => task.id === overId)
            )

            if (sourceColumn && targetColumn) {
                const oldIndex = sourceColumn.tasks.findIndex(task => task.id === taskId)
                const newIndex = targetColumn.tasks.findIndex(task => task.id === overId)

                if (oldIndex !== newIndex) {
                    await moveTask(taskId, targetColumn.id, newIndex)
                }
            }
        }
    }

    async function handleCreateColumn(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!state.newColumnTitle.trim()) return

        await createColumn(state.newColumnTitle.trim())

        mergeState({
            newColumnTitle: "",
            isCreatingColumn: false
        })
    }
    
    async function handleUpdateColumn(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!state.newColumnTitle.trim()) return

        await updateColumn(state.editingColumn!.id, {
            title: state.newColumnTitle.trim()
        })

        mergeState({
            newColumnTitle: "",
            editingColumn: null,
            isEditingColumn: false
        })
    }

    let filterCount = 0

    if (state.filters.dueDate) {
        filterCount++
    }
    if (!state.filters.assignee.all) {
        filterCount += Object.values(state.filters.assignee).filter(bool => bool).length
    }
    if (!state.filters.priority.all) {
        filterCount += Object.values(state.filters.priority).filter(bool => bool).length
    }

    const columnsWithFilters = columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(task => {
            if (!state.filters.priority.all && !state.filters.priority[task.priority]) {
                return false
            }

            if (!state.filters.assignee.all && !state.filters.assignee[task.assignee || ""]) {
                return false
            }

            if (state.filters.dueDate && !task.due_date) {
                return false
            }

            if (state.filters.dueDate && task.due_date) {
                const taskDueDate = new Date(task.due_date).toDateString()
                const filterDueDate = new Date(state.filters.dueDate).toDateString()
                
                if (taskDueDate !== filterDueDate) {
                    return false
                }
            }

            return true
        })
    }))

    const taskCount = columns.reduce((sum, col) => sum + col.tasks.length, 0)

    const userCount = users.length
    
    const liveUsersAvatars = Object.values(state.liveUsers).map(u => ({
        name: u.full_name,
        image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/avatars/${u.avatar_img_name}?cb=${u.avatar_img_cb}`
    }))

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <Navbar
                    boardTitle={board?.title}
                    onEditBoard={() => mergeState({
                        isEditingTitle: true,
                        newTitle: board?.title,
                        newColor: board?.color
                    })}
                    onFilterClick={() => mergeState({
                        isFilterOpen: true,
                    })}
                    filterCount={filterCount}
                />
                <Dialog
                    open={state.isEditingTitle}
                    onOpenChange={bool => mergeState({ isEditingTitle: bool })}
                >
                    <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                        <DialogHeader>
                            <DialogTitle>
                                Edit Board
                            </DialogTitle>
                        </DialogHeader>
                        <form className="space-y-4" onSubmit={handleUpdateBoard}>
                            <div className="space-y-2">
                                <Label htmlFor="boardTitle">Board Title</Label>
                                <Input
                                    id="boardTitle"
                                    value={state.newTitle}
                                    onChange={e => mergeState({ newTitle: e.target.value})}
                                    placeholder="Enter board title..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="boardColor">Board Color</Label>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {[
                                        "bg-blue-500",
                                        "bg-green-500",
                                        "bg-yellow-500",
                                        "bg-red-500",
                                        "bg-purple-500",
                                        "bg-pink-500",
                                        "bg-indigo-500",
                                        "bg-gray-500",
                                        "bg-orange-500",
                                        "bg-teal-500",
                                        "bg-cyan-500",
                                        "bg-emerald-500",
                                    ].map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`w-8 h-8 rounded-full ${color} ${color === state.newColor ? "ring-2 ring-offset-2 ring-gray-900" : ""}`}
                                            onClick={() => mergeState({ newColor: color })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => mergeState({ isEditingTitle: false })}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Save Changes
                                </Button>
                            </div>
                        </form>

                    </DialogContent>
                </Dialog>
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
                                Filter Tasks
                            </DialogTitle>
                            <p className="text-sm text-gray-600">
                                Filter tasks by priority, assignee, or due date
                            </p>
                        </DialogHeader>
                        <div className="space-y-4 ">
                            <div className="space-y-2">
                                <Label>Priority</Label>

                                <div className="flex flex-wrap gap-2">
                                    {["low", "medium", "high"].map((priority) => (
                                        <Button
                                            key={priority}
                                            variant={state.newFilters.priority[priority] ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => mergeState(({ newFilters }) => {
                                                const copiedFilters: typeof newFilters = JSON.parse(JSON.stringify(newFilters))
                                                
                                                if (copiedFilters.priority.all) {
                                                    copiedFilters.priority.all = false
                                                    copiedFilters.priority[priority] = true
                                                    return { newFilters: copiedFilters }
                                                }

                                                if (!copiedFilters.priority[priority]) {
                                                    copiedFilters.priority[priority] = true
                                                    return { newFilters: copiedFilters }
                                                }

                                                if (Object.values(copiedFilters.priority).filter(bool => bool).length > 1) {
                                                    copiedFilters.priority[priority] = false
                                                    return { newFilters: copiedFilters }
                                                }

                                                copiedFilters.priority[priority] = false
                                                copiedFilters.priority.all = true
                                                return { newFilters: copiedFilters }
                                            })}
                                        >
                                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Assignee</Label>

                                <div className="flex flex-wrap gap-2">
                                    {[...new Set(columns
                                        .flatMap(col => col.tasks)
                                        .map(task => task.assignee)
                                        .filter(assignee => assignee !== null))
                                    ].map((assignee) => (
                                        <Button
                                            key={assignee}
                                            variant={state.newFilters.assignee[assignee] ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => mergeState(({ newFilters }) => {
                                                const copiedFilters: typeof newFilters = JSON.parse(JSON.stringify(newFilters))
                                                    
                                                if (copiedFilters.assignee.all) {
                                                    copiedFilters.assignee.all = false
                                                    copiedFilters.assignee[assignee] = true
                                                    return { newFilters: copiedFilters }
                                                }

                                                if (!copiedFilters.assignee[assignee]) {
                                                    copiedFilters.assignee[assignee] = true
                                                    return { newFilters: copiedFilters }
                                                }

                                                if (Object.values(copiedFilters.assignee).filter(bool => bool).length > 1) {
                                                    copiedFilters.assignee[assignee] = false
                                                    return { newFilters: copiedFilters }
                                                }

                                                copiedFilters.assignee[assignee] = false
                                                copiedFilters.assignee.all = true
                                                return { newFilters: copiedFilters }
                                            })}
                                        >
                                            {assignee.charAt(0).toUpperCase() + assignee.slice(1)}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input
                                    type="date"
                                    value={state.newFilters.dueDate || ""}
                                    onChange={e => mergeState({
                                        newFilters: {
                                            ...state.newFilters,
                                            dueDate: e.target.value || null
                                        }
                                    })}
                                />
                            </div>
                            <div className="flex justify-between pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => mergeState({
                                        isFilterOpen: false,
                                        filters: DEFAULT_FILTERS,
                                        newFilters: DEFAULT_FILTERS
                                    })}
                                >
                                    Clear Filters
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => mergeState({
                                        isFilterOpen: false,
                                        filters: state.newFilters 
                                    })}
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-600">
                                {taskCount}
                                {taskCount === 1 ? " Task" : " Tasks"}
                            </div>
                            <span className="text-sm">·</span>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="text-sm font-bold text-gray-600 cursor-pointer hover:underline">
                                        {userCount}
                                        {userCount === 1 ? " Member" : " Members"}
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="w-[95vw] max-w-[425px] mx-auto h-[95vh] sm:h-max max-h-[425px] flex flex-col overflow-scroll">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Members
                                        </DialogTitle>
                                        <p className="text-sm text-gray-500">
                                            See who is collaborating on this board.
                                        </p>
                                    </DialogHeader>
                                    {users?.map(user => (
                                        <div key={user.id} className="flex space-x-6 items-center">
                                            <Avatar className="w-14 h-14">
                                                <AvatarImage
                                                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/avatars/${user.avatar_img_name}?cb=${user.avatar_img_cb}&width=56&height=56`}
                                                    alt={`Profile picture for ${user.full_name}`}
                                                />
                                                <AvatarFallback>
                                                    <div className="w-14 h-14 rounded-full flex justify-center items-center bg-blue-100">
                                                        <UserRound className="h-8 w-8 text-blue-600 stroke-[2.5]" />
                                                    </div>
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{user.full_name}</span>
                                        </div>
                                    ))}
                                </DialogContent>
                            </Dialog>
                            <span className="text-sm">·</span>
                            <div className="text-sm font-medium text-gray-600">
                                {Object.keys(state.liveUsers).length} Online
                            </div>
                            <AvatarStack avatars={liveUsersAvatars} />
                        </div>

                        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full sm:w-auto">
                                        <Plus />
                                        Invite People
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Add Collaborators
                                        </DialogTitle>
                                        <p className="text-sm text-gray-500">
                                            Invite others to this board. They will be able to see, create, update, and delete tasks. They will not be able to remove other users.
                                        </p>
                                    </DialogHeader>
                                    <p className="text-sm text-gray-900">
                                        Copy the link below and send it to anyone you want to invite to this board. They must already be a user of Trello Clone.
                                    </p>
                                    <p className="text-sm text-gray-900">
                                        Your invite link is:
                                    </p>
                                    <p className="font-mono text-sm my-6 pl-2 py-1 rounded bg-gray-600 text-white">
                                        {`${process.env.NEXT_PUBLIC_SITE_URL!}/invite/board/${id}`}
                                    </p>
                                    <DialogClose asChild>
                                        <Button variant="outline" className="w-1/3 ml-auto">
                                            Got it
                                        </Button>
                                    </DialogClose>
                                </DialogContent>
                            </Dialog>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full sm:w-auto">
                                        <Plus />
                                        Add Task
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Create New Task
                                        </DialogTitle>
                                        <p className="text-sm text-gray-600">
                                            Add a task to the board
                                        </p>
                                    </DialogHeader>
                                    <form className="space-y-4" onSubmit={handleCreateTask}>
                                        <div className="space-y-2">
                                            <Label>Title *</Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                placeholder="Enter task title"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                placeholder="Enter task description"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Assignee</Label>
                                            <Input
                                                id="assignee"
                                                name="assignee"
                                                placeholder="Assign this task to someone"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Priority</Label>
                                            <Select name="priority" defaultValue="medium">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {["low", "medium", "high"].map((priority) => (
                                                        <SelectItem key={priority} value={priority}>
                                                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Due Date</Label>
                                            <Input type="date" id="dueDate" name="dueDate" />
                                        </div>
                                        <div className="flex justify-end space-x-2 pt-4">
                                            <Button type="submit">Create Task</Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={rectIntersection}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto lg:pb-6 lg:px-2 lg:-mx-2 lg:[&::-webkit-scrollbar]:h-2 lg:[&::-webkit-scrollbar-track]:bg-gray-100 lg:[&::-webkit-scrollbar-thumb]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:rounded-full space-y-4 lg:space-y-0">
                            {columnsWithFilters.map((column) => (
                                <DroppableColumn
                                    key={column.id}
                                    column={column}
                                    onCreateTask={handleCreateTask}
                                    onEditColumn={() => mergeState({
                                        isEditingColumn: true,
                                        editingColumn: column,
                                        newColumnTitle: column.title
                                    })}
                                >
                                    <SortableContext
                                        items={column.tasks.map(task => task.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-3">
                                            {column.tasks.map((task) => (
                                                <SortableTask key={task.id} task={task} />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DroppableColumn>
                            ))}

                            <div className="w-full lg:flex-shrink-0 lg:w-80">
                                <Button
                                    variant="outline"
                                    className="w-full h-full min-h-[200px] border-dashed border-2 text-gray-500 hover:text-gray-700"
                                    onClick={() => mergeState({ isCreatingColumn: true })}
                                >
                                    <Plus />
                                    Add Column
                                </Button>
                            </div>

                            <DragOverlay>
                                {state.activeTask && <TaskOverlay task={state.activeTask} />}
                            </DragOverlay>
                        </div>
                    </DndContext>
                </main>
            </div>
            <Dialog
                open={state.isCreatingColumn}
                onOpenChange={bool => mergeState({ isCreatingColumn: bool })}
            >
                <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Create New Column
                        </DialogTitle>
                        <p className="text-sm text-gray-600">
                            Add a column to organize your tasks
                        </p>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleCreateColumn}>
                        <div className="space-y-2">
                            <Label>
                                Column Title
                            </Label>
                            <Input
                                id="columnTitle"
                                value={state.newColumnTitle}
                                onChange={e => mergeState({ newColumnTitle: e.target.value })}
                                placeholder="Enter a column title..."
                                required
                            />
                        </div>
                        <div className="space-x-2 flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => mergeState({
                                    isCreatingColumn: false,
                                    newColumnTitle: ""
                                })}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Create Column
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog
                open={state.isEditingColumn}
                onOpenChange={bool => mergeState({ isEditingColumn: bool })}
            >
                <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Edit Column
                        </DialogTitle>
                        <p className="text-sm text-gray-600">
                            Edit the title of your column
                        </p>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleUpdateColumn}>
                        <div className="space-y-2">
                            <Label>
                                Column Title
                            </Label>
                            <Input
                                id="columnTitle"
                                value={state.newColumnTitle}
                                onChange={e => mergeState({ newColumnTitle: e.target.value })}
                                placeholder="Enter a column title..."
                                required
                            />
                        </div>
                        <div className="space-x-2 flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => mergeState({
                                    isEditingColumn: false,
                                    editingColumn: null,
                                    newColumnTitle: "",
                                })}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Update Column
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}