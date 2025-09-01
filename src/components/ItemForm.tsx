import React, { useState } from 'react';
import { Price } from '../types';
import PriceSelector from './PriceSelector';
import styles from './ItemForm.module.css';

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
    <section className={styles['item-form-section']}>
      <h2 className={styles['form-title']}>הוסף מוצר חדש</h2>
      <form onSubmit={handleSubmit} className={styles['item-form']}>
        <div className={styles['form-field']}>
          <label htmlFor="item-name" className={styles['field-label']}>שם המוצר:</label>
          <input
            type="text"
            id="item-name"
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
              if (nameError) setNameError('');
            }}
            className={`${styles['text-input']} ${
              nameError ? styles['input-error'] : styles['input-normal']
            }`}
          />
          <div className={styles['error-container']}>
            {nameError && <span className={styles['error-text']}>{nameError}</span>}
          </div>
        </div>

        <div className={styles['form-field']}>
          <label htmlFor="item-description" className={styles['field-label']}>תיאור המוצר (אופציונלי):</label>
          <textarea
            id="item-description"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            rows={3}
            className={styles['textarea-input']}
            placeholder="הוסף תיאור למוצר..."
          />
        </div>

        <div className={styles['form-field']}>
          <PriceSelector
            prices={prices}
            currentPrice={currentPrice}
            onPricesChange={(newPrices, newCurrentPrice) => {
              setPrices(newPrices);
              setCurrentPrice(newCurrentPrice);
              if (priceError) setPriceError('');
            }}
          />
          <div className={styles['error-container']}>
            {priceError && <span className={styles['error-text']}>{priceError}</span>}
          </div>
        </div>

        <button 
          type="submit"
          className={styles['add-item-button']}
        >
          הוסף מוצר
        </button>
      </form>
    </section>
  );
};

export default ItemForm;