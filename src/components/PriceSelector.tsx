import React, { useState, useEffect } from 'react';
import { Price } from '../types';
import styles from './PriceSelector.module.css';

interface PriceSelectorProps {
  prices: Price[];
  currentPrice: number;
  onPricesChange: (prices: Price[], currentPrice: number) => void;
  className?: string;
}

const PriceSelector: React.FC<PriceSelectorProps> = ({
  prices,
  currentPrice,
  onPricesChange,
  className = ''
}) => {
  const [localPrices, setLocalPrices] = useState<Price[]>(prices.length > 0 ? prices : [{ amount: 0, label: 'מחיר רגיל' }]);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState<number>(
    localPrices.findIndex(p => p.amount === currentPrice) !== -1 
      ? localPrices.findIndex(p => p.amount === currentPrice)
      : 0
  );

  useEffect(() => {
    if (prices.length > 0) {
      setLocalPrices(prices);
      const index = prices.findIndex(p => p.amount === currentPrice);
      setSelectedPriceIndex(index !== -1 ? index : 0);
    }
  }, [prices, currentPrice]);

  const handlePriceChange = (index: number, field: 'amount' | 'label', value: string | number) => {
    const updatedPrices = localPrices.map((price, i) => 
      i === index 
        ? { ...price, [field]: field === 'amount' ? Number(value) : value }
        : price
    );
    setLocalPrices(updatedPrices);
    
    // Update current price if this is the selected price
    const newCurrentPrice = selectedPriceIndex === index && field === 'amount' 
      ? Number(value) 
      : updatedPrices[selectedPriceIndex]?.amount || 0;
    
    onPricesChange(updatedPrices, newCurrentPrice);
  };

  const handleCurrentPriceChange = (index: number) => {
    setSelectedPriceIndex(index);
    onPricesChange(localPrices, localPrices[index]?.amount || 0);
  };

  const addPrice = () => {
    if (localPrices.length < 2) {
      const newPrices = [...localPrices, { amount: 0, label: 'מחיר מבצע' }];
      setLocalPrices(newPrices);
      onPricesChange(newPrices, localPrices[selectedPriceIndex]?.amount || 0);
    }
  };

  const removePrice = (index: number) => {
    if (localPrices.length > 1) {
      const newPrices = localPrices.filter((_, i) => i !== index);
      setLocalPrices(newPrices);
      
      // Adjust selected price index if needed
      const newSelectedIndex = selectedPriceIndex >= index && selectedPriceIndex > 0 
        ? selectedPriceIndex - 1 
        : selectedPriceIndex;
      setSelectedPriceIndex(newSelectedIndex);
      
      onPricesChange(newPrices, newPrices[newSelectedIndex]?.amount || 0);
    }
  };

  return (
    <div className={`${styles['price-selector-container']} ${className}`}>
      <label className={styles['section-title']}>
        מחירים (עד 2 מחירים)
      </label>
      
      {localPrices.map((price, index) => (
        <div key={index} className={styles['price-item']}>
          {/* Radio button to select current price */}
          <input
            type="radio"
            name="currentPrice"
            checked={selectedPriceIndex === index}
            onChange={() => handleCurrentPriceChange(index)}
            className={styles['radio-input']}
          />
          
          {/* Price amount input */}
          <div className={styles['price-item']}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price.amount || ''}
              onChange={(e) => handlePriceChange(index, 'amount', e.target.value)}
              placeholder="מחיר"
              className={styles['price-input']}
            />
          </div>
          
          {/* Price label input */}
          <div className={styles['price-item']}>
            <input
              type="text"
              value={price.label}
              onChange={(e) => handlePriceChange(index, 'label', e.target.value)}
              placeholder="תווית מחיר"
              className={styles['price-label']}
            />
          </div>
          
          {/* Remove button */}
          {localPrices.length > 1 && (
            <button
              type="button"
              onClick={() => removePrice(index)}
              className={styles['remove-button']}
              title="הסר מחיר"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      ))}
      
      {/* Add price button */}
      {localPrices.length < 2 && (
        <button
          type="button"
          onClick={addPrice}
          className={styles['add-price-button']}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>הוסף מחיר נוסף</span>
        </button>
      )}
      
      {/* Price display preview */}
      <div className={styles['current-price-section']}>
        <p className={styles['section-title']}>תצוגה מקדימה:</p>
        <div className={styles['radio-group']}>
          {localPrices.map((price, index) => (
            <span
              key={index}
              className={`${styles['radio-label']} ${
                selectedPriceIndex === index
                  ? styles['current-price']
                  : styles['other-price']
              }`}
            >
              ₪{price.amount.toFixed(2)}
            </span>
          ))}
        </div>
        <p className={styles['radio-label']}>
          המחיר הנבחר (עם הנקודה הירוקה) יוצג כמחיר הנוכחי
        </p>
      </div>
    </div>
  );
};

export default PriceSelector;