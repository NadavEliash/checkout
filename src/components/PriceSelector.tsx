import React, { useState, useEffect } from 'react';
import { Price } from '../types';
import './PriceSelector.css';

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
    <div className="price-selector">
      <label className="selector-label">
        מחירים (עד 2 מחירים)
      </label>
      
      {localPrices.map((price, index) => (
        <div key={index} className="price-item">
          {/* Radio button to select current price */}
          <input
            type="radio"
            name="currentPrice"
            className="price-radio"
            checked={selectedPriceIndex === index}
            onChange={() => handleCurrentPriceChange(index)}
          />
          
          {/* Price amount input */}
          <div className="input-group">
            <input
              type="number"
              min="0"
              step="0.01"
              className="price-input"
              value={price.amount || ''}
              onChange={(e) => handlePriceChange(index, 'amount', e.target.value)}
              placeholder="מחיר"
            />
          </div>
          
          {/* Price label input */}
          <div className="input-group">
            <input
              type="text"
              className="label-input"
              value={price.label}
              onChange={(e) => handlePriceChange(index, 'label', e.target.value)}
              placeholder="תווית מחיר"
            />
          </div>
          
          {/* Remove button */}
          {localPrices.length > 1 && (
            <button
              type="button"
              onClick={() => removePrice(index)}
              className="action-button danger"
              title="הסר מחיר"
            >
              <img className='icon small' src='/assts/Icons/delete.svg' alt='מחק'/>
            </button>
          )}
        </div>
      ))}
      
      {/* Add price button */}
      {localPrices.length < 2 && (
        <button
          type="button"
          onClick={addPrice}
          className="action-button secondary"
        >
          <img className='icon small' src='/assts/Icons/add.svg' alt='+'/>
          <span>הוסף מחיר נוסף</span>
        </button>
      )}
      
      {/* Price display preview */}
      <div className="price-preview">
        <p className="preview-title">תצוגה מקדימה:</p>
        <div className="preview-prices">
          {localPrices.map((price, index) => (
            <span
              key={index}
              className="preview-price"
            >
              ₪{price.amount.toFixed(2)}
            </span>
          ))}
        </div>
        <p className="preview-note">
          המחיר הנבחר (עם הנקודה הירוקה) יוצג כמחיר הנוכחי
        </p>
      </div>
    </div>
  );
};

export default PriceSelector;