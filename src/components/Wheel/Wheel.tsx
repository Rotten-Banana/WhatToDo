import React, { useState, useRef } from 'react';
import { useTodo } from '../../context/TodoContext';
import { WheelItem } from '../WheelItem/WheelItem';
import { ItemModal } from '../ItemModal/ItemModal';
import { Button } from '../Button/Button';
import type { TodoItem } from '../../types';
import './Wheel.css';

export const Wheel: React.FC = () => {
    const { getCurrentItems, navigateTo, navigateBack, currentPath, addItem, updateItem, deleteItem } = useTodo();
    const items = getCurrentItems();
    const [rotation, setRotation] = useState(0);
    const wheelRef = useRef<HTMLDivElement>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingItem, setEditingItem] = useState<TodoItem | undefined>(undefined);
    const [targetParentId, setTargetParentId] = useState<string | null>(null);

    // Winner State
    const [winner, setWinner] = useState<TodoItem | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);

    const radius = 250;

    const [transitionEnabled, setTransitionEnabled] = useState(true);

    const handleItemClick = (id: string) => {
        if (isSpinning) return;
        const item = items.find(i => i.id === id);
        if (item) {
            if (item.children.length > 0) {
                // Disable transition for instant reset
                setTransitionEnabled(false);
                navigateTo(id);
                setRotation(0);

                // Re-enable transition after a brief delay to ensure DOM update
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setTransitionEnabled(true);
                    });
                });
            } else {
                setWinner(item); // Show winner modal for manual selection too
            }
        }
    };

    const handleDelete = (item: TodoItem) => {
        deleteItem(item.id);
    };

    const handleSpin = () => {
        if (items.length === 0 || isSpinning) return;

        setIsSpinning(true);
        setWinner(null);

        const totalPriority = items.reduce((sum, item) => sum + (item.priority || 1), 0);
        let randomValue = Math.random() * totalPriority;
        let selectedIndex = 0;

        for (let i = 0; i < items.length; i++) {
            randomValue -= (items[i].priority || 1);
            if (randomValue <= 0) {
                selectedIndex = i;
                break;
            }
        }

        const count = items.length;
        const anglePerItem = 360 / count;
        const targetAngle = selectedIndex * anglePerItem;

        // Add extra spins
        const extraSpins = 5 * 360;
        const newRotation = rotation + extraSpins + (360 - (rotation % 360)) + (270 - targetAngle);

        setRotation(newRotation);

        setTimeout(() => {
            setIsSpinning(false);
            const selectedItem = items[selectedIndex];
            console.log('Spin finished. Index:', selectedIndex, 'Item:', selectedItem);

            if (selectedItem) {
                setWinner(selectedItem);
            } else {
                console.error('Winner selection failed: Item not found at index', selectedIndex);
            }
        }, 3500);
    };

    const handleWinnerAck = () => {
        if (winner && winner.children.length > 0) {
            setTransitionEnabled(false);
            navigateTo(winner.id);
            setRotation(0);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTransitionEnabled(true);
                });
            });
        }
        setWinner(null);
    };

    const openAddModal = (parentId: string | null = null) => {
        setModalMode('add');
        setTargetParentId(parentId);
        setEditingItem(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (item: TodoItem) => {
        setModalMode('edit');
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSaveItem = (title: string, priority: number) => {
        if (modalMode === 'add') {
            const parentId = targetParentId !== null ? targetParentId : (currentPath.length > 0 ? currentPath[currentPath.length - 1] : null);
            addItem(parentId, { title, priority, completed: false });
        } else if (modalMode === 'edit' && editingItem) {
            updateItem(editingItem.id, { title, priority });
        }
    };

    return (
        <div className="wheel-container">
            <div className="wheel-controls">
                {currentPath.length > 0 && <Button variant="secondary" onClick={navigateBack}>Back</Button>}
                <Button variant="primary" onClick={handleSpin} disabled={isSpinning}>Spin!</Button>
                <Button variant="success" onClick={() => openAddModal(null)} disabled={isSpinning}>Add Item</Button>
            </div>

            <div className="wheel-pointer" />

            <div
                className="wheel"
                ref={wheelRef}
                style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: transitionEnabled ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                }}
            >
                {items.map((item, index) => (
                    <WheelItem
                        key={item.id}
                        item={item}
                        angle={index * (360 / items.length)}
                        radius={radius}
                        rotation={rotation}
                        transitionEnabled={transitionEnabled}
                        onClick={() => handleItemClick(item.id)}
                        onEdit={openEditModal}
                        onAddChild={(i) => openAddModal(i.id)}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {items.length === 0 && (
                <div className="empty-state">
                    <p>No items here.</p>
                    <Button variant="primary" onClick={() => openAddModal(null)}>Add First Item</Button>
                </div>
            )}

            <ItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveItem}
                mode={modalMode}
                initialTitle={editingItem?.title}
                initialPriority={editingItem?.priority}
            />

            {winner && (
                <div className="winner-overlay" onClick={handleWinnerAck}>
                    <div className="winner-card" onClick={e => e.stopPropagation()}>
                        <h2>🎉 Selected! 🎉</h2>
                        <div className="winner-title">{winner.title}</div>
                        <div className="winner-priority">Priority: {Array(winner.priority).fill('⭐').join('')}</div>
                        <Button variant="primary" size="large" onClick={handleWinnerAck}>
                            {winner.children.length > 0 ? 'Open Sub-list' : 'Done'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
