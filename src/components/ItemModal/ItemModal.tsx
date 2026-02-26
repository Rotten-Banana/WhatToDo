import React, { useState, useEffect } from 'react';
import './ItemModal.css';
import { Button } from '../Button/Button';

interface ItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string, priority: number) => void;
    initialTitle?: string;
    initialPriority?: number;
    mode: 'add' | 'edit';
}

export const ItemModal: React.FC<ItemModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialTitle = '',
    initialPriority = 1,
    mode
}) => {
    const [title, setTitle] = useState(initialTitle);
    const [priority, setPriority] = useState(initialPriority);

    useEffect(() => {
        if (isOpen) {
            setTitle(initialTitle);
            setPriority(initialPriority);
        }
    }, [isOpen, initialTitle, initialPriority]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onSave(title, priority);
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{mode === 'add' ? 'Add Item' : 'Edit Item'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Priority (1-5)</label>
                        <div className="priority-selector">
                            {[1, 2, 3, 4, 5].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    className={`priority-btn ${priority === p ? 'active' : ''}`}
                                    onClick={() => setPriority(p)}
                                    style={{ borderColor: getPriorityColor(p) }}
                                >
                                    {p} {getPriorityEmoji(p)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="modal-actions">
                        <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
                        <Button type="submit" variant="primary">Save</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const getPriorityColor = (p: number) => {
    switch (p) {
        case 5: return '#ff4d4d';
        case 4: return '#ff9933';
        case 3: return '#ffff66';
        case 2: return '#99ff99';
        case 1: return '#66b3ff';
        default: return '#ccc';
    }
};

const getPriorityEmoji = (p: number) => {
    switch (p) {
        case 5: return '🔥';
        case 4: return '⚡';
        case 3: return '⭐';
        case 2: return '🌿';
        case 1: return '💧';
        default: return '';
    }
};
