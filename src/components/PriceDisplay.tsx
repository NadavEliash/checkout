import React from 'react';
import { Price } from '../types';
import styles from './PriceDisplay.module.css';

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
      <span className={`${styles['other-price']} ${className}`}>
        ₪0.00
      </span>
    );
  }

  const sizeClasses = {
    sm: styles['small'],
    md: styles['medium'],
    lg: styles['large']
  };

  const currentPriceObj = prices.find(p => p.amount === currentPrice);
  const otherPrices = prices.filter(p => p.amount !== currentPrice);

  return (
    <div className={`${styles['price-container']} ${className}`}>
      {/* Current price - highlighted */}
      {currentPriceObj && (
        <div className={styles['current-price']}>
          <span className={`${styles['current-price']} ${sizeClasses[size]}`}>
            ₪{currentPriceObj.amount.toFixed(2)}
          </span>
          {showLabels && currentPriceObj.label && (
            <span className={styles['price-label']}>
              {currentPriceObj.label}
            </span>
          )}
        </div>
      )}
      
      {/* Other prices - crossed out */}
      {otherPrices.map((price, index) => (
        <div key={index} className={styles['other-price']}>
          <span className={`${styles['other-price']} ${sizeClasses[size]}`}>
            ₪{price.amount.toFixed(2)}
          </span>
          {showLabels && price.label && (
            <span className={styles['other-price-label']}>
              {price.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default PriceDisplay;