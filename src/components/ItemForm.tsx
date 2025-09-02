import React, { useState } from 'react';
import { Price } from '../types';
import PriceSelector from './PriceSelector';

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
    <section style={{
      background: 'var(--color-white-transparent)',
      padding: 'var(--spacing-2xl)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-xl)',
      marginBottom: 'var(--spacing-2xl)'
    }}>
      <h2 style={{
        fontSize: 'var(--font-2xl)',
        color: 'var(--color-gray-700)',
        marginBottom: 'var(--spacing-xl)',
        fontWeight: 'var(--font-semibold)',
        textAlign: 'center'
      }}>הוסף מוצר חדש</h2>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 'var(--spacing-lg)'
        }}>
          <label htmlFor="item-name" style={{
            fontWeight: 'var(--font-semibold)',
            marginBottom: 'var(--spacing-sm)',
            color: 'var(--color-gray-600)'
          }}>שם המוצר:</label>
          <input
            type="text"
            id="item-name"
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
              if (nameError) setNameError('');
            }}
            style={{
              padding: 'var(--spacing-md)',
              border: `2px solid ${nameError ? 'var(--color-error)' : 'var(--color-gray-300)'}`,
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-base)',
              transition: 'border-color var(--transition-normal)',
              outline: 'none'
            }}
            onFocus={(e) => {
              if (!nameError) e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              if (!nameError) e.currentTarget.style.borderColor = 'var(--color-gray-300)';
            }}
          />
          <div style={{
            minHeight: 'var(--spacing-2xl)',
            display: 'flex',
            alignItems: 'center'
          }}>
            {nameError && <span style={{
              color: 'var(--color-error)',
              fontSize: 'var(--font-sm)',
              marginTop: 'var(--spacing-xs)'
            }}>{nameError}</span>}
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 'var(--spacing-lg)'
        }}>
          <label htmlFor="item-description" style={{
            fontWeight: 'var(--font-semibold)',
            marginBottom: 'var(--spacing-sm)',
            color: 'var(--color-gray-600)'
          }}>תיאור המוצר (אופציונלי):</label>
          <textarea
            id="item-description"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            rows={3}
            style={{
              padding: 'var(--spacing-md)',
              border: '2px solid var(--color-gray-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-base)',
              transition: 'border-color var(--transition-normal)',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-gray-300)'}
            placeholder="הוסף תיאור למוצר..."
          />
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 'var(--spacing-lg)'
        }}>
          <PriceSelector
            prices={prices}
            currentPrice={currentPrice}
            onPricesChange={(newPrices, newCurrentPrice) => {
              setPrices(newPrices);
              setCurrentPrice(newCurrentPrice);
              if (priceError) setPriceError('');
            }}
          />
          <div style={{
            minHeight: 'var(--spacing-2xl)',
            display: 'flex',
            alignItems: 'center'
          }}>
            {priceError && <span style={{
              color: 'var(--color-error)',
              fontSize: 'var(--font-sm)',
              marginTop: 'var(--spacing-xs)'
            }}>{priceError}</span>}
          </div>
        </div>

        <button 
          type="submit"
          style={{
            padding: 'var(--spacing-lg) var(--spacing-xl)',
            backgroundColor: 'var(--color-success)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'var(--font-semibold)',
            fontSize: 'var(--font-base)',
            cursor: 'pointer',
            transition: 'all var(--transition-normal)',
            width: '100%',
            justifyContent: 'center'
          }}
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