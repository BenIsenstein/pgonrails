"use client"

import { boardDataService, boardService, columnService, taskService } from "@/lib/services"
import { Board, BoardUser, Column, ColumnWithTasks, Task } from "../supabase/models";
import { useAppContext } from "../contexts/appContext";
import { useMergeState } from "./useMergeState";
import { useEffect } from "react";

export function useBoards() {
    const { user } = useAppContext()
    const [state, mergeState] = useMergeState({
        boards: [] as Board[],
        loading: true,
        error: null as string | null
    })

    useEffect(() => {
        (async function loadBoards() {
            if (!user) return

            try {
                mergeState({ loading: true, error: null })
                const boards = await boardService.getBoards()
                mergeState({ loading: false, boards })
            } catch (error) {
                mergeState({
                    loading: false,
                    error: error instanceof Error ? error.message : "Failed to load boards."
                })
            }
        })()
    }, [user, mergeState])

    async function createBoard(boardData: {
        title: string;
        description?: string;
        color?: string;
    }) {
        if (!user) {
            throw new Error("No signed-in user.")
        }

        try {
            const newBoard = await boardDataService.createBoardWithDefaultColumns({
                ...boardData,
                creator: user.user_metadata?.full_name || "No Name"
            })

            if (!newBoard) {
                return
            }

            mergeState(prev => ({ boards: [newBoard, ...prev.boards] }))
        } catch (error) {
            mergeState({
                error: error instanceof Error ? error.message : "Failed to create board."
            })
        }
    }

    return { ...state, createBoard }
}

export function useBoard(boardId: string) {
    const [state, mergeState] = useMergeState({
        board: null as Board | null,
        columns: [] as ColumnWithTasks[],
        users: [] as BoardUser[],
        loading: true,
        error: null as string | null
    })
    const { user } = useAppContext()

    useEffect(() => {
        if (!boardId) return

        (async function loadBoard() {
            try {
                mergeState({ loading: true, error: null })
                const { board, columns, users } = await boardDataService.getBoardWithColumns(boardId)
                mergeState({ loading: false, board, columns, users })
            } catch (error) {
                mergeState({
                    loading: false,
                    error: error instanceof Error ? error.message : `Failed to load board with ID [${boardId}]`
                })
            }
        })()
    }, [boardId, mergeState])

    async function updateBoard(updates: Partial<Board>) {
        try {
            const board = await boardService.updateBoard(boardId, updates)
            mergeState({ board })
            return board
        } catch (error) {
            mergeState({
                error: error instanceof Error ? error.message : `Failed to update board with ID [${boardId}]`
            })
        }
    }

    async function createRealTask(
        columnId: string,
        taskData: {
            title: string
            description?: string
            assignee?: string
            dueDate?: string
            priority: "low" | "medium" | "high"
        }
    ) {
        try {
            const newTask = await taskService.createTask({
                title: taskData.title,
                description: taskData.description || null,
                assignee: taskData.assignee || null,
                due_date: taskData.dueDate || null,
                column_id: columnId,
                priority: taskData.priority || "medium",
                sort_order: state.columns.find(col => col.id === columnId)?.tasks?.length || 0
            })

            mergeState((current) => ({
                columns: current.columns.map((col) => (
                    col.id === columnId
                        ? ({
                            ...col,
                            tasks: [...col.tasks, newTask]
                        })
                        : col
                ))
            }))

            return newTask
        } catch (error) {
            mergeState({
                error: error instanceof Error ? error.message : "Failed to create task"
            })
        }
    }

    async function moveTask(taskId: string, newColumnId: string, newOrder: number) {
        try {
            await taskService.moveTask(taskId, newColumnId, newOrder)

            mergeState(prev => {
                const newColumns = [...prev.columns]
                let taskToMove: Task | null = null

                for (const col of newColumns) {
                    const taskIndex = col.tasks.findIndex(task => task.id === taskId)

                    if (taskIndex !== -1) {
                        taskToMove = col.tasks.splice(taskIndex, 1)[0]
                        break
                    }
                }

                if (taskToMove) {
                    const targetColumn = newColumns.find(col => col.id === newColumnId)
                    
                    if (targetColumn) {
                        targetColumn.tasks.splice(newOrder, 0, taskToMove)
                    }
                }

                return { columns: newColumns }
            })
        } catch (error) {
            mergeState({
                error: error instanceof Error ? error.message : "Failed to move task"
            })
        }
    }

    async function createColumn(title: string) {
        if (!user) throw new Error("User not signed in")
        if (!state.board) throw new Error("Board not loaded")
        
        try {
            const newColumn = await columnService.createColumn({
                title,
                sort_order: state.columns.length,
                board_id: boardId
            })

            mergeState(prev => ({
                columns: [...prev.columns, { ...newColumn, tasks: [] }]
            }))

            return newColumn
        } catch (error) {
            mergeState({
                error: error instanceof Error ? error.message : "Failed to create column"
            })
        }
    }

    async function updateColumn(columnId: string, updates: Partial<Column>) {
        try {
            const updatedColumn = await columnService.updateColumn(columnId, updates)

            mergeState(prev => ({
                columns: prev.columns.map(col =>
                    col.id === columnId ? ({ ...col, ...updatedColumn }) : col
                )
            }))

            return updatedColumn
        } catch (error) {
            mergeState({
                error: error instanceof Error ? error.message : `Failed to update board with ID [${boardId}]`
            })
        }
    }

    return { ...state, mergeState, updateBoard, createRealTask, moveTask, createColumn, updateColumn }
}