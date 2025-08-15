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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-gray-800 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto pb-32">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:text-gray-200 font-semibold"
            >
              ← חזור לעמוד הבית
            </button>
            <h1 className="text-3xl font-bold text-white">דף מכירות</h1>
            <UserMenu />
          </div>
        
          {items.length === 0 ? (
            <div className="text-center">
              <p className="text-white mb-4">אין פריטים זמינים למכירה</p>
              <button
                onClick={() => navigate('/create')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                צור פריטים חדשים
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-lg p-4 shadow-md flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItemIds.includes(item.id)}
                    onChange={() => handleItemToggle(item.id)}
                    className="ml-4 w-5 h-5 text-indigo-600"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <div className="text-sm text-gray-600">
                      {item.prices.map((price, index) => (
                        <span key={index} className="ml-2">
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

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-lg font-semibold">
            סה"כ: ₪{calculateTotal()}
          </div>
          <button
            onClick={handleContinueToCheckout}
            disabled={selectedItemIds.length === 0}
            className={`px-6 py-3 rounded-lg font-semibold ${
              selectedItemIds.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
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