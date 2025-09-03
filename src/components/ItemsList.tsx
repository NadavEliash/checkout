import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item } from '../types';
import PriceDisplay from './PriceDisplay';
import ItemEditForm from './ItemEditForm';
import './ItemsList.css';

interface ItemsListProps {
  items: Item[];
  onUpdateItem: (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onReorderItems: (startIndex: number, endIndex: number) => Promise<void>;
}



const ItemsList: React.FC<ItemsListProps> = ({ items, onUpdateItem, onDeleteItem, onReorderItems }) => {
  const navigate = useNavigate();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorderItems(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleEditClick = (itemId: string) => {
    setEditingItemId(itemId);
  };

  const handleEditSave = async (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      await onUpdateItem(id, updates);
      setEditingItemId(null);
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingItemId(null);
  };

  const handleCreateCheckoutPage = (): void => {
    navigate('/sell');
  };

  if (items.length === 0) {
    return (
      <section className="items-list-section">
        <h2 className="section-title">רשימת המוצרים שלי</h2>
        <div className="empty-state">
          <p className="empty-message">
            עדיין לא הוספת מוצרים. התחל על ידי הוספת המוצר הראשון שלך!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="items-list-section">
      <h2 className="section-title">רשימת המוצרים שלי</h2>
      <div className="items-list">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="item-card"
            draggable={editingItemId !== item.id}
            onDragStart={editingItemId !== item.id ? (e) => handleDragStart(e, index) : undefined}
            onDragOver={editingItemId !== item.id ? (e) => handleDragOver(e, index) : undefined}
            onDragLeave={editingItemId !== item.id ? handleDragLeave : undefined}
            onDrop={editingItemId !== item.id ? (e) => handleDrop(e, index) : undefined}
            onDragEnd={editingItemId !== item.id ? handleDragEnd : undefined}
          >
            {editingItemId === item.id ? (
              <ItemEditForm
                item={item}
                onSave={handleEditSave}
                onCancel={handleEditCancel}
              />
            ) : (
              <>
                <div className="item-content">
                  <div className="item-name">{item.name}</div>
                  <PriceDisplay 
                    prices={item.prices}
                    currentPrice={item.currentPrice}
                    size="lg"
                    showLabels={true}
                  />
                  <div className="item-actions">
                    <button 
                      onClick={() => handleEditClick(item.id)} 
                      title="ערוך מוצר"
                      className="action-button secondary"
                    >
                      ערוך
                    </button>
                    <button 
                      onClick={() => onDeleteItem(item.id)} 
                      title="מחק מוצר"
                      className="action-button danger"
                    >
                      <img src="/assets/Icons/delete.svg" alt="מחק" width={24} className="icon" />
                    </button>
                  </div>
                </div>
                {item.description && (
                  <div className="item-description">{item.description}</div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <button 
          type="button"
          onClick={handleCreateCheckoutPage}
          className="action-button"
        >
          צור עמוד תשלום ({items.length} מוצרים)
        </button>
      )}
    </section>
  );
};

export default ItemsList;