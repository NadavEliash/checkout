import React, { useState, useEffect } from 'react';
import { Item, Price } from '../types';
import PriceSelector from './PriceSelector';

interface ItemEditFormProps {
  item: Item;
  onSave: (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  onCancel: () => void;
}

const ItemEditForm: React.FC<ItemEditFormProps> = ({ item, onSave, onCancel }) => {
  const [itemName, setItemName] = useState(item.name);
  const [itemDescription, setItemDescription] = useState(item.description || '');
  const [prices, setPrices] = useState<Price[]>(item.prices);
  const [currentPrice, setCurrentPrice] = useState<number>(item.currentPrice);
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    setNameError('');
    setPriceError('');
    
    let hasErrors = false;
    
    if (!itemName.trim()) {
      setNameError('שדה זה חובה');
      hasErrors = true;
    }
    
    const validPrices = prices.filter(p => p.amount > 0);
    if (validPrices.length === 0) {
      setPriceError('נדרש לפחות מחיר אחד');
      hasErrors = true;
    }
    
    if (currentPrice <= 0) {
      setPriceError('יש לבחור מחיר נוכחי תקין');
      hasErrors = true;
    }
    
    if (hasErrors) {
      return;
    }
    
    setIsLoading(true);
    try {
      await onSave(item.id, {
        name: itemName.trim(),
        description: itemDescription.trim() || undefined,
        prices: validPrices,
        currentPrice
      });
    } catch (error) {
      console.error('Failed to save item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-4">
      <div className="flex flex-col">
        <label htmlFor={`edit-name-${item.id}`} className="font-semibold mb-1 text-gray-600 text-sm">שם המוצר:</label>
        <input
          type="text"
          id={`edit-name-${item.id}`}
          value={itemName}
          onChange={(e) => {
            setItemName(e.target.value);
            if (nameError) setNameError('');
          }}
          className={`p-2 border rounded-lg text-sm transition-colors focus:outline-none ${
            nameError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
          }`}
          disabled={isLoading}
        />
        {nameError && <span className="text-red-500 text-xs mt-1">{nameError}</span>}
      </div>

      <div className="flex flex-col">
        <label htmlFor={`edit-description-${item.id}`} className="font-semibold mb-1 text-gray-600 text-sm">תיאור המוצר:</label>
        <textarea
          id={`edit-description-${item.id}`}
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
          rows={2}
          className="p-2 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-blue-500 resize-vertical"
          placeholder="הוסף תיאור למוצר..."
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col">
        <PriceSelector
          prices={prices}
          currentPrice={currentPrice}
          onPricesChange={(newPrices, newCurrentPrice) => {
            setPrices(newPrices);
            setCurrentPrice(newCurrentPrice);
            if (priceError) setPriceError('');
          }}
        />
        {priceError && <span className="text-red-500 text-xs mt-1">{priceError}</span>}
      </div>

      <div className="flex gap-2 pt-2">
        <button 
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-green-600 text-white border-none py-2 px-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'שומר...' : 'שמור'}
        </button>
        <button 
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-gray-600 text-white border-none py-2 px-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          ביטול
        </button>
      </div>
    </form>
  );
};

export default ItemEditForm;