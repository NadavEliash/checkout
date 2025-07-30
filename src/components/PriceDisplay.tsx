import React from 'react';
import { Price } from '../types';

interface PriceDisplayProps {
  prices: Price[];
  currentPrice: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  prices,
  currentPrice,
  className = '',
  size = 'md',
  showLabels = false
}) => {
  if (!prices || prices.length === 0) {
    return (
      <span className={`text-gray-500 ${className}`}>
        ₪0.00
      </span>
    );
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  const currentPriceObj = prices.find(p => p.amount === currentPrice);
  const otherPrices = prices.filter(p => p.amount !== currentPrice);

  return (
    <div className={`flex items-center justify-end space-x-2 space-x-reverse ${className}`}>
      {/* Current price - highlighted */}
      {currentPriceObj && (
        <div className="flex flex-col items-end">
          <span className={`font-semibold text-green-600 ${sizeClasses[size]}`}>
            ₪{currentPriceObj.amount.toFixed(2)}
          </span>
          {showLabels && currentPriceObj.label && (
            <span className="text-xs text-green-700">
              {currentPriceObj.label}
            </span>
          )}
        </div>
      )}
      
      {/* Other prices - crossed out */}
      {otherPrices.map((price, index) => (
        <div key={index} className="flex flex-col items-end">
          <span className={`text-gray-500 line-through ${sizeClasses[size]}`}>
            ₪{price.amount.toFixed(2)}
          </span>
          {showLabels && price.label && (
            <span className="text-xs text-gray-500">
              {price.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default PriceDisplay;