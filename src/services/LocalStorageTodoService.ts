import type { TodoItem } from '../types';
import type { TodoService } from './TodoService';

const STORAGE_KEY = 'recursive_todo_wheel_v1';

export class LocalStorageTodoService implements TodoService {
    async load(): Promise<TodoItem[]> {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            return [];
        }
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse todo data', e);
            return [];
        }
    }

    async save(items: TodoItem[]): Promise<void> {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
}
