export interface TodoItem {
  id: string;
  title: string;
  children: TodoItem[];
  completed: boolean;
  priority: number; // 1 (Low) to 5 (High)
  color?: string;
  parentId?: string | null;
}

export interface TodoTree {
  root: TodoItem[];
}
