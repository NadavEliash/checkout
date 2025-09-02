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
    <div  dir="rtl">
      <div >
        <div >
          <div >
            <button
              onClick={() => navigate('/')}
              
            >
              ← עמוד הבית
            </button>
            <button
              onClick={handleBackToSell}
              
            >
              | דף מכירות
            </button>
          </div>
          <h1 >עגלת קניות</h1>
          <UserMenu />
        </div>

        {cartItems.length === 0 ? (
          <p >אין פריטים בעגלה</p>
        ) : (
          <div >
            <div >
              {cartItems.map(cartItem => (
                <div key={cartItem.item.id} >
                  <div >
                    <h3 >{cartItem.item.name}</h3>
                    <button
                      onClick={() => removeFromCart(cartItem.item.id)}
                      
                      title="הסר מהעגלה"
                    >
                      <svg  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div >
                    <PriceDisplay 
                      prices={cartItem.item.prices}
                      currentPrice={cartItem.item.currentPrice}
                      size="md"
                      showLabels={true}
                    />
                    <div >
                      <button
                        onClick={() => updateCartItemQuantity(cartItem.item.id, cartItem.quantity - 1)}
                        
                        disabled={cartItem.quantity <= 1}
                      >
                        -
                      </button>
                      <span >
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItemQuantity(cartItem.item.id, cartItem.quantity + 1)}
                        
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div >
                    סה"כ לפריט: ₪{(cartItem.item.currentPrice * cartItem.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div >
              <div >
                <span >סה"כ לתשלום:</span>
                <span >₪{getTotalPrice().toFixed(2)}</span>
              </div>
              
              <button
                onClick={handlePayment}
                
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