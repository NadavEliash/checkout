import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import UserMenu from './UserMenu';

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
    <div  dir="rtl">
      <div >
        <header >
          <div >
            <button
              onClick={() => navigate('/')}
              
            >
              חזור לעמוד הבית
            </button>
            <UserMenu />
          </div>
          <div >
            <h1 >דף מכירות</h1>
            <p >בחר פריטים למכירה והמשך לתשלום</p>
          </div>
        </header>

        <div >
        
          {items.length === 0 ? (
            <div >
              <p >אין פריטים זמינים למכירה</p>
              <button
                onClick={() => navigate('/create')}
                
              >
                צור פריטים חדשים
              </button>
            </div>
          ) : (
            <div >
              {items.map(item => (
                <div key={item.id} >
                  <input
                    type="checkbox"
                    checked={selectedItemIds.includes(item.id)}
                    onChange={() => handleItemToggle(item.id)}
                    style={{ marginLeft: '1rem', width: '1.25rem', height: '1.25rem', accentColor: '#4f46e5' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 >{item.name}</h3>
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

        <div >
          <div >
          <div >
            סה"כ: ₪{calculateTotal()}
          </div>
          <button
            onClick={handleContinueToCheckout}
            disabled={selectedItemIds.length === 0}
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