import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { TodoItem } from '../types';
import type { TodoService } from '../services/TodoService';
import { LocalStorageTodoService } from '../services/LocalStorageTodoService';
import { v4 as uuidv4 } from 'uuid';

interface TodoContextType {
    items: TodoItem[];
    currentPath: string[]; // Stack of IDs, empty = root
    addItem: (parentId: string | null, item: Omit<TodoItem, 'id' | 'children'>) => void;
    updateItem: (id: string, updates: Partial<TodoItem>) => void;
    deleteItem: (id: string) => void;
    navigateTo: (id: string) => void;
    navigateBack: () => void;
    getCurrentItems: () => TodoItem[];
    loading: boolean;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<TodoItem[]>([]);
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Use a ref or memo for service to avoid recreating? 
    // Since it has no state, it's fine.
    const todoService: TodoService = new LocalStorageTodoService();

    useEffect(() => {
        const loadData = async () => {
            const data = await todoService.load();
            setItems(data);
            setLoading(false);
        };
        loadData();
    }, []);

    useEffect(() => {
        if (!loading) {
            todoService.save(items);
        }
    }, [items, loading]);

    const findNodeAndParent = (nodes: TodoItem[], id: string): { node: TodoItem, parent: TodoItem[] } | null => {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === id) {
                return { node: nodes[i], parent: nodes };
            }
            if (nodes[i].children.length > 0) {
                const result = findNodeAndParent(nodes[i].children, id);
                if (result) return result;
            }
        }
        return null;
    };

    // Helper to update tree immutably
    const updateTree = (nodes: TodoItem[], id: string, updater: (node: TodoItem) => TodoItem): TodoItem[] => {
        return nodes.map(node => {
            if (node.id === id) {
                return updater(node);
            }
            if (node.children.length > 0) {
                return { ...node, children: updateTree(node.children, id, updater) };
            }
            return node;
        });
    };

    const addItem = useCallback((parentId: string | null, newItemData: Omit<TodoItem, 'id' | 'children'>) => {
        const newItem: TodoItem = {
            ...newItemData,
            id: uuidv4(),
            children: [],
            parentId: parentId
        };

        setItems(prevItems => {
            if (!parentId) {
                return [...prevItems, newItem];
            }
            return updateTree(prevItems, parentId, node => ({
                ...node,
                children: [...node.children, newItem]
            }));
        });
    }, []);

    const updateItem = useCallback((id: string, updates: Partial<TodoItem>) => {
        setItems(prevItems => updateTree(prevItems, id, node => ({ ...node, ...updates })));
    }, []);

    const deleteItem = useCallback((id: string) => {
        const deleteFromNodes = (nodes: TodoItem[]): TodoItem[] => {
            return nodes.filter(node => node.id !== id).map(node => ({
                ...node,
                children: deleteFromNodes(node.children)
            }));
        };
        setItems(prevItems => deleteFromNodes(prevItems));
    }, []);

    const navigateTo = useCallback((id: string) => {
        setCurrentPath(prev => [...prev, id]);
    }, []);

    const navigateBack = useCallback(() => {
        setCurrentPath(prev => prev.slice(0, -1));
    }, []);

    const getCurrentItems = useCallback(() => {
        if (currentPath.length === 0) return items;
        let currentLevel = items;
        for (const id of currentPath) {
            const node = currentLevel.find(n => n.id === id);
            if (node) {
                currentLevel = node.children;
            } else {
                // Path invalid?
                return [];
            }
        }
        return currentLevel;
    }, [items, currentPath]);

    return (
        <TodoContext.Provider value={{
            items,
            currentPath,
            addItem,
            updateItem,
            deleteItem,
            navigateTo,
            navigateBack,
            getCurrentItems,
            loading
        }}>
            {children}
        </TodoContext.Provider>
    );
};

export const useTodo = () => {
    const context = useContext(TodoContext);
    if (!context) {
        throw new Error('useTodo must be used within a TodoProvider');
    }
    return context;
};
