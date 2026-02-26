import React from 'react';
import type { TodoItem } from '../../types';
import { Button } from '../Button/Button';
import './WheelItem.css';

interface WheelItemProps {
    item: TodoItem;
    angle: number;
    radius: number;
    rotation: number;
    transitionEnabled: boolean;
    onClick: () => void;
    onEdit: (item: TodoItem) => void;
    onAddChild: (item: TodoItem) => void;
    onDelete: (item: TodoItem) => void;
}

export const WheelItem: React.FC<WheelItemProps> = ({ item, angle, radius, rotation, transitionEnabled, onClick, onEdit, onAddChild, onDelete }) => {
    const style: React.CSSProperties = {
        transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg) rotate(${-rotation}deg)`,
        transition: transitionEnabled ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
    };

    const priorityColor = () => {
        switch (item.priority) {
            case 5: return '#ff4d4d'; // Red
            case 4: return '#ff9933'; // Orange
            case 3: return '#ffff66'; // Yellow
            case 2: return '#99ff99'; // Green
            case 1: return '#66b3ff'; // Blue
            default: return '#ccc';
        }
    };

    return (
        <div className="wheel-item" style={style} onClick={onClick}>
            <div className="wheel-item-content" style={{ borderColor: priorityColor() }}>
                <span className="priority-indicator">{Array(item.priority).fill('⭐').join('')}</span>
                <span className="item-title">{item.title}</span>
                {item.children.length > 0 && <span className="has-children-indicator">▶</span>}

                <div className="item-actions">
                    <Button
                        variant="icon"
                        className="edit-btn"
                        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                        title="Edit"
                    >
                        ✎
                    </Button>
                    <Button
                        variant="icon"
                        className="add-child-btn"
                        onClick={(e) => { e.stopPropagation(); onAddChild(item); }}
                        title="Add Sub-item"
                    >
                        +
                    </Button>
                    <Button
                        variant="icon"
                        className="delete-btn"
                        onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                        title="Delete"
                    >
                        🗑️
                    </Button>
                </div>
            </div>
        </div>
    );
};
