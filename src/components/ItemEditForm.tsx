import React, { useState } from 'react';
import { Item, Price } from '../types';
import PriceSelector from './PriceSelector';
import './ItemEditForm.css';

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
    <form onSubmit={handleSubmit} className="edit-form">
      <div className="form-field">
        <label htmlFor={`edit-name-${item.id}`} className="form-label">שם המוצר:</label>
        <input
          type="text"
          id={`edit-name-${item.id}`}
          className="form-input"
          value={itemName}
          onChange={(e) => {
            setItemName(e.target.value);
            if (nameError) setNameError('');
          }}
          disabled={isLoading}
        />
        {nameError && <span className="error-text">{nameError}</span>}
      </div>

      <div className="form-field">
        <label htmlFor={`edit-description-${item.id}`} className="form-label">תיאור המוצר:</label>
        <textarea
          id={`edit-description-${item.id}`}
          className="form-textarea"
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
          rows={2}
          placeholder="הוסף תיאור למוצר..."
          disabled={isLoading}
        />
      </div>

      <div className="form-field">
        <PriceSelector
          prices={prices}
          currentPrice={currentPrice}
          onPricesChange={(newPrices, newCurrentPrice) => {
            setPrices(newPrices);
            setCurrentPrice(newCurrentPrice);
            if (priceError) setPriceError('');
          }}
        />
        {priceError && <span className="error-text">{priceError}</span>}
      </div>

      <div className="form-actions">
        <button 
          type="submit"
          disabled={isLoading}
          className="action-button"
        >
          {isLoading ? 'שומר...' : 'שמור'}
        </button>
        <button 
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="action-button secondary"
        >
          ביטול
        </button>
      </div>
    </form>
  );
};

export default ItemEditForm;