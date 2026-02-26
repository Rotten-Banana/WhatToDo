import type { TodoItem } from '../types';

export interface TodoService {
    load(): Promise<TodoItem[]>;
    save(items: TodoItem[]): Promise<void>;
}
