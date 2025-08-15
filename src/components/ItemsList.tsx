import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item } from '../types';
import PriceDisplay from './PriceDisplay';
import ItemEditForm from './ItemEditForm';

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
      <section className="bg-white/95 p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl text-gray-700 mb-5 text-center font-semibold">רשימת המוצרים שלי</h2>
        <div className="min-h-48">
          <p className="text-center text-gray-400 italic py-10 px-5">
            עדיין לא הוספת מוצרים. התחל על ידי הוספת המוצר הראשון שלך!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white/95 p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl text-gray-700 mb-5 text-center font-semibold">רשימת המוצרים שלי</h2>
      <div className="min-h-48">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className={`
              bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4 transition-opacity
              ${editingItemId === item.id ? '' : 'cursor-grab hover:translate-y-0.5 hover:shadow-lg'}
              ${draggedIndex === index ? 'opacity-70' : ''}
              ${dragOverIndex === index ? 'border-2 border-indigo-500' : ''}
            `}
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
                <div className="flex justify-between items-center mb-3 gap-3">
                  <div className="text-xl font-semibold text-gray-700 flex-1">{item.name}</div>
                  <PriceDisplay 
                    prices={item.prices}
                    currentPrice={item.currentPrice}
                    size="lg"
                    showLabels={true}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditClick(item.id)} 
                      title="ערוך מוצר"
                      className="bg-blue-500 hover:bg-blue-600 text-white border-none p-2 rounded-md cursor-pointer text-sm font-semibold transition-all flex items-center justify-center min-w-[50px]"
                    >
                      ערוך
                    </button>
                    <button 
                      onClick={() => onDeleteItem(item.id)} 
                      title="מחק מוצר"
                      className="bg-white/30 border-none p-2 rounded-md cursor-pointer text-base transition-all flex items-center justify-center"
                    >
                      <img className="opacity-30 hover:opacity-100" src="/assets/Icons/delete.svg" alt="מחק" width={24} />
                    </button>
                  </div>
                </div>
                {item.description && (
                  <div className="text-gray-600 text-sm mt-2 mb-2">{item.description}</div>
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
          className="w-full mt-4 bg-gradient-to-r from-green-500 to-blue-600 text-white border-none p-4 rounded-lg text-lg font-semibold cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-lg"
        >
          צור עמוד תשלום ({items.length} מוצרים)
        </button>
      )}
    </section>
  );
};

export default ItemsList;