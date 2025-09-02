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
      <span>
        ₪0.00
      </span>
    );
  }


  const currentPriceObj = prices.find(p => p.amount === currentPrice);
  const otherPrices = prices.filter(p => p.amount !== currentPrice);

  return (
    <div>
      {/* Current price - highlighted */}
      {currentPriceObj && (
        <div >
          <span>
            ₪{currentPriceObj.amount.toFixed(2)}
          </span>
          {showLabels && currentPriceObj.label && (
            <span >
              {currentPriceObj.label}
            </span>
          )}
        </div>
      )}
      
      {/* Other prices - crossed out */}
      {otherPrices.map((price, index) => (
        <div key={index} >
          <span>
            ₪{price.amount.toFixed(2)}
          </span>
          {showLabels && price.label && (
            <span >
              {price.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default PriceDisplay;