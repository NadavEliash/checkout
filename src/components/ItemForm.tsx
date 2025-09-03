import React, { useState } from 'react';
import { Price } from '../types';
import PriceSelector from './PriceSelector';
import './ItemForm.css';

interface ItemFormProps {
  onAddItem: (name: string, prices: Price[], currentPrice: number, description?: string) => Promise<void>;
}

const ItemForm: React.FC<ItemFormProps> = ({ onAddItem }) => {
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [prices, setPrices] = useState<Price[]>([{ amount: 0, label: 'מחיר רגיל' }]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [items, setItems] = useState<{
    id: string;
    name: string;
    description?: string;
    prices: Price[];
    image?: string;
  }[]>([]);


  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Reset errors
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
    
    // Add to local items list
    const newItem = {
      id: Date.now().toString(),
      name: itemName,
      description: itemDescription.trim() || undefined,
      prices: validPrices,
      image: '' // Empty for now
    };
    setItems(prev => [...prev, newItem]);
    
    await onAddItem(itemName, validPrices, currentPrice, itemDescription.trim() || undefined);
    
    // Reset form
    setItemName('');
    setItemDescription('');
    setPrices([{ amount: 0, label: 'מחיר רגיל' }]);
    setCurrentPrice(0);
  };

  return (
    <section className="item-form-section">
      <h2 className="form-title">הוסף מוצר חדש</h2>
      <form onSubmit={handleSubmit} className="item-form">
        <div className="form-field">
          <label htmlFor="item-name" className="form-label">שם המוצר:</label>
          <input
            type="text"
            id="item-name"
            className="form-input"
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
              if (nameError) setNameError('');
            }}
            onFocus={(e) => {
              if (!nameError) e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              if (!nameError) e.currentTarget.style.borderColor = 'var(--color-gray-300)';
            }}
          />
          <div className="error-container">
            {nameError && <span className="error-text">{nameError}</span>}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="item-description" className="form-label">תיאור המוצר (אופציונלי):</label>
          <textarea
            id="item-description"
            className="form-textarea"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            rows={3}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-gray-300)'}
            placeholder="הוסף תיאור למוצר..."
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
          <div className="error-container">
            {priceError && <span className="error-text">{priceError}</span>}
          </div>
        </div>

        <button 
          type="submit"
          className="action-button"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-success-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-success)'}
        >
          הוסף מוצר
        </button>
      </form>
    </section>
  );
};

export default ItemForm;