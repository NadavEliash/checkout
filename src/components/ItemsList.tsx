import React, { useState } from 'react';
import { Item } from '../types';

interface ItemsListProps {
  items: Item[];
  onDeleteItem: (itemId: string) => void;
  onReorderItems: (startIndex: number, endIndex: number) => void;
}

const ItemsList: React.FC<ItemsListProps> = ({ items, onDeleteItem, onReorderItems }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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
              bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4 transition-opacity cursor-grab
              hover:translate-y-0.5 hover:shadow-lg
              ${draggedIndex === index ? 'opacity-70' : ''}
              ${dragOverIndex === index ? 'border-2 border-indigo-500' : ''}
            `}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex justify-between items-center mb-3 gap-3">
              <div className="text-xl font-semibold text-gray-700 flex-1">{item.name}</div>
              <div className="flex flex-col gap-2">
                {item.prices.map((price, priceIndex) => (
                  <span key={priceIndex} className="text-xl font-medium">
                    {price.label ? `${price.label}: ` : ''}{price.amount.toFixed(2)}  ₪
                  </span>
                ))}
              </div>
              <button onClick={() => onDeleteItem(item.id)} title="מחק מוצר"
                className="bg-white/30 border-none p-2 rounded-md cursor-pointer text-base transition-all flex items-center justify-center">
                <img className="opacity-30 hover:opacity-100" src="/assets/delete.svg" alt="מחק" width={24} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ItemsList;