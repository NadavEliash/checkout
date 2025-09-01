import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import UserMenu from './UserMenu';
import styles from './SellPage.module.css';

const SellPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, addToCart, clearCart } = useItems();
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const handleItemToggle = (itemId: string) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getSelectedItemsData = () => {
    return items.filter(item => selectedItemIds.includes(item.id));
  };

  const calculateTotal = () => {
    return getSelectedItemsData().reduce((total, item) => {
      const minPrice = Math.min(...item.prices.map(p => p.amount));
      return total + minPrice;
    }, 0);
  };

  const handleContinueToCheckout = () => {
    // Clear cart first to avoid duplicate items
    clearCart();
    
    // Add selected items to cart
    const selectedItemsData = getSelectedItemsData();
    selectedItemsData.forEach(item => {
      addToCart(item.id, 1);
    });
    
    // Navigate to cart
    navigate('/cart');
  };

  return (
    <div className={styles['sell-page']} dir="rtl">
      <div className={styles['sell-page-content']}>
        <header className={styles['sell-page-header']}>
          <div className={styles['header-navigation']}>
            <button
              onClick={() => navigate('/')}
              className={styles['back-to-home-button']}
            >
              חזור לעמוד הבית
            </button>
            <UserMenu />
          </div>
          <div className={styles['page-title-section']}>
            <h1 className={styles['page-title']}>דף מכירות</h1>
            <p className={styles['page-subtitle']}>בחר פריטים למכירה והמשך לתשלום</p>
          </div>
        </header>

        <div className={styles['items-selection-section']}>
        
          {items.length === 0 ? (
            <div className={styles['empty-items-message']}>
              <p className={styles['empty-message-text']}>אין פריטים זמינים למכירה</p>
              <button
                onClick={() => navigate('/create')}
                className={styles['create-new-items-button']}
              >
                צור פריטים חדשים
              </button>
            </div>
          ) : (
            <div className={styles['items-list']}>
              {items.map(item => (
                <div key={item.id} className={styles['selectable-item-card']}>
                  <input
                    type="checkbox"
                    checked={selectedItemIds.includes(item.id)}
                    onChange={() => handleItemToggle(item.id)}
                    style={{ marginLeft: '1rem', width: '1.25rem', height: '1.25rem', accentColor: '#4f46e5' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 className={styles['item-name']}>{item.name}</h3>
                    <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                      {item.prices.map((price, index) => (
                        <span key={index} style={{ marginLeft: '0.5rem' }}>
                          {price.label}: ₪{price.amount}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles['checkout-bar']}>
          <div className={styles['checkout-bar-content']}>
          <div className={styles['total-price']}>
            סה"כ: ₪{calculateTotal()}
          </div>
          <button
            onClick={handleContinueToCheckout}
            disabled={selectedItemIds.length === 0}
            className={`${styles['checkout-button']} ${
              selectedItemIds.length === 0
                ? styles['button-disabled']
                : styles['button-enabled']
            }`}
          >
            המשך לתשלום ({selectedItemIds.length})
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellPage;