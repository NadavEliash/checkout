import React, { useState, useEffect } from 'react';
import { Price } from '../types';

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
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        מחירים (עד 2 מחירים)
      </label>
      
      {localPrices.map((price, index) => (
        <div key={index} className="flex items-center space-x-2 space-x-reverse bg-gray-50 p-3 rounded-lg">
          {/* Radio button to select current price */}
          <input
            type="radio"
            name="currentPrice"
            checked={selectedPriceIndex === index}
            onChange={() => handleCurrentPriceChange(index)}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
          />
          
          {/* Price amount input */}
          <div className="flex-1">
            <input
              type="number"
              min="0"
              step="0.01"
              value={price.amount || ''}
              onChange={(e) => handlePriceChange(index, 'amount', e.target.value)}
              placeholder="מחיר"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right"
            />
          </div>
          
          {/* Price label input */}
          <div className="flex-1">
            <input
              type="text"
              value={price.label}
              onChange={(e) => handlePriceChange(index, 'label', e.target.value)}
              placeholder="תווית מחיר"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right"
            />
          </div>
          
          {/* Remove button */}
          {localPrices.length > 1 && (
            <button
              type="button"
              onClick={() => removePrice(index)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
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
          className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>הוסף מחיר נוסף</span>
        </button>
      )}
      
      {/* Price display preview */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm font-medium text-blue-900 mb-2">תצוגה מקדימה:</p>
        <div className="flex items-center justify-end space-x-2 space-x-reverse">
          {localPrices.map((price, index) => (
            <span
              key={index}
              className={`text-lg font-semibold ${
                selectedPriceIndex === index
                  ? 'text-green-600'
                  : 'text-gray-500 line-through'
              }`}
            >
              ₪{price.amount.toFixed(2)}
            </span>
          ))}
        </div>
        <p className="text-xs text-blue-700 mt-1">
          המחיר הנבחר (עם הנקודה הירוקה) יוצג כמחיר הנוכחי
        </p>
      </div>
    </div>
  );
};

export default PriceSelector;