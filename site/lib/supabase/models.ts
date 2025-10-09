export interface Board {
  id: string;
  title: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  creator: string;
  tasks: Task[]
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  sort_order: number;
  created_at: string;
}

export type ColumnWithTasks = Column & {
  tasks: Task[];
};

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  assignee: string | null;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  sort_order: number;
  created_at: string;
}

export interface BoardUser {
  id: string
  full_name: string
  avatar_img_name: string
  avatar_img_cb: string
}