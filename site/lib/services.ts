import { supabase } from "@/lib/supabase/client"
import { Board, BoardUser, Column, ColumnWithTasks, Task } from "@/lib/supabase/models"
import { DEFAULT_COLUMNS } from "@/lib/constants"

export const boardService = {
    async createBoard(board: Omit<Board, "id" | "created_at" | "updated_at" | "tasks">): Promise<Board> {
        const { data, error } = await supabase.rpc("create_board", board)

        if (error) throw error

        return data
    },

    async getBoards(): Promise<Board[]> {
        const { data, error } = await supabase
            .from("boards")
            .select(`
                *,
                columns(
                    tasks(*)
                )
            `)
            .order("created_at", { ascending: false })

        if (error) throw error

        for (const board of data) {
            board.tasks = board.columns.flatMap((col: ColumnWithTasks) => col.tasks)
            delete board.columns
        }

        return data || []
    },

    async getBoard(boardId: string): Promise<Board> {
        const { data, error } = await supabase
            .from("boards")
            .select("*")
            .eq("id", boardId)
            .single()

        if (error) throw error

        return data || []
    },

    async updateBoard(boardId: string, updates: Partial<Board>): Promise<Board> {
        const { data, error } = await supabase
            .from("boards")
            .update(updates)
            .eq("id", boardId)
            .select()
            .single()
        
        if (error) throw error

        return data
    }
}

export const columnService = {
    async createColumn(column: Omit<Column, "id" | "created_at">): Promise<Column> {
        const { data, error } = await supabase
            .from("columns")
            .insert(column)
            .select("*")
            .single()

        if (error) throw error

        return data
    },

    async getColumnsForBoard(boardId: string): Promise<Column[]> {
        const { data, error } = await supabase
            .from("columns")
            .select("*")
            .eq("board_id", boardId)
            .order("sort_order", { ascending: true })

        if (error) throw error

        return data || []
    },

    async updateColumn(columnId: string, updates: Partial<Column>): Promise<Column> {
        const { data, error } = await supabase
            .from("columns")
            .update(updates)
            .eq("id", columnId)
            .select()
            .single()
        
        if (error) throw error

        return data
    }
}

export const taskService = {
    async getTasksForBoard(boardId: string): Promise<Task[]> {
        const { data, error } = await supabase
            .from("tasks")
            .select(`
                *,
                columns!inner(board_id)
            `)
            .eq("columns.board_id", boardId)
            .order("sort_order", { ascending: true })

        if (error) throw error

        return data || []
    },

    async createTask(task: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task> {
        const { data, error } = await supabase
            .from("tasks")
            .insert(task)
            .select()
            .single()

        if (error) throw error

        return data
    },

    async moveTask(taskId: string, newColumnId: string, newOrder: number) {
        const { data, error } = await supabase
            .from("tasks")
            .update({
                column_id: newColumnId,
                sort_order: newOrder
            })
            .eq("id", taskId)
        
        if (error) throw error

        return data
    }
}

export const userService = {
    async getUsersForBoard(board_id: string): Promise<BoardUser[]> {
        const { data, error } = await supabase.rpc("get_users_for_board", { board_id_arg: board_id })
        
        if (error) throw error

        return data
    }
}

export const boardDataService = {
    async createBoardWithDefaultColumns(boardData: {
      title: string
      description?: string
      color?: string
      creator: string
    }) {
        let board: Board

        try {
            board = await boardService.createBoard({
                title: boardData.title,
                description: boardData.description || null,
                color: boardData.color || "bg-blue-500",
                creator: boardData.creator
            })
        } catch {
            return
        }

        try {
            await Promise.all(
                DEFAULT_COLUMNS.map(column => 
                    columnService.createColumn({
                        ...column,
                        board_id: board.id
                    })
                )
            )
        } catch {}

        board.tasks = []
        return board
    },

    async getBoardWithColumns(boardId: string): Promise<{
        board: Board
        columns: ColumnWithTasks[]
        users: BoardUser[]
    }> {
        const [board, columns, users] = await Promise.all([
            boardService.getBoard(boardId),
            columnService.getColumnsForBoard(boardId),
            userService.getUsersForBoard(boardId)
        ])

        if (!board) {
            throw new Error(`Board with ID [${boardId}] not found.`)
        }

        const tasks = await taskService.getTasksForBoard(boardId)

        const columnsWithTasks = columns.map((column) => ({
            ...column,
            tasks: tasks.filter(task => task.column_id === column.id)
        }))

        return { board, columns: columnsWithTasks, users }
    }
}