import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import UserMenu from './UserMenu';
import PriceDisplay from './PriceDisplay';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, updateCartItemQuantity, removeFromCart } = useItems();

  const handlePayment = () => {
    const total = getTotalPrice();
    console.log(`Total price: ₪${total}`);
  };

  const handleBackToSell = () => {
    navigate('/sell');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-gray-800 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:text-gray-200 font-semibold"
            >
              ← עמוד הבית
            </button>
            <button
              onClick={handleBackToSell}
              className="text-white hover:text-gray-200 font-semibold"
            >
              | דף מכירות
            </button>
          </div>
          <h1 className="text-3xl font-bold text-white">עגלת קניות</h1>
          <UserMenu />
        </div>

        {cartItems.length === 0 ? (
          <p className="text-center text-white">אין פריטים בעגלה</p>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {cartItems.map(cartItem => (
                <div key={cartItem.item.id} className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{cartItem.item.name}</h3>
                    <button
                      onClick={() => removeFromCart(cartItem.item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="הסר מהעגלה"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <PriceDisplay 
                      prices={cartItem.item.prices}
                      currentPrice={cartItem.item.currentPrice}
                      size="md"
                      showLabels={true}
                    />
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => updateCartItemQuantity(cartItem.item.id, cartItem.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        disabled={cartItem.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-3 py-1 bg-gray-100 rounded-md font-semibold">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItemQuantity(cartItem.item.id, cartItem.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 text-left">
                    סה"כ לפריט: ₪{(cartItem.item.currentPrice * cartItem.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-100 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold">סה"כ לתשלום:</span>
                <span className="text-2xl font-bold text-indigo-600">₪{getTotalPrice().toFixed(2)}</span>
              </div>
              
              <button
                onClick={handlePayment}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                בצע תשלום
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;