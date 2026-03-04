export interface TodoItem {
  id: string;
  title: string;
  children: TodoItem[];
  completed: boolean;
  priority: number;
  color?: string;
  parentId?: string | null;
}

export interface TodoTree {
  root: TodoItem[];
}
