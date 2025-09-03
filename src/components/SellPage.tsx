import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import Layout from './Layout';
import './SellPage.css';

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
    <Layout>
      <div className="sell-page">
        <div className="sell-container">
          <div className="page-header">
            <h1 className="page-title">דף מכירות</h1>
            <p className="page-description">בחר פריטים למכירה והמשך לתשלום</p>
          </div>

          <div className="sell-main">
          
            {items.length === 0 ? (
              <div className="empty-state">
                <p className="empty-message">בקרוב יהיו כאן פריטים</p>
                <button
                  onClick={() => navigate('/create')}
                  className="action-button"
                >
                  צור פריטים חדשים
                </button>
              </div>
            ) : (
              <div className="items-grid">
                {items.map(item => (
                  <div key={item.id} className="item-card">
                    <input
                      type="checkbox"
                      className="item-checkbox"
                      checked={selectedItemIds.includes(item.id)}
                      onChange={() => handleItemToggle(item.id)}
                    />
                    <div className="item-content">
                      <h3 className="item-name">{item.name}</h3>
                      <div className="item-prices">
                        {item.prices.map((price, index) => (
                          <span key={index} className="price-tag">
                            {price.label}: ₪{price.amount}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          <div className="checkout-section">
            <div className="checkout-summary">
            <div className="total-amount">
              סה"כ: ₪{calculateTotal()}
            </div>
            <button
              onClick={handleContinueToCheckout}
              disabled={selectedItemIds.length === 0}
              className="action-button"
            >
              המשך לתשלום ({selectedItemIds.length})
            </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SellPage;