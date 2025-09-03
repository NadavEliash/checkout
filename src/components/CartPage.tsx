import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import Layout from './Layout';
import PriceDisplay from './PriceDisplay';
import './CartPage.css';

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
    <Layout>
      <div className="cart-page">
        <div className="cart-container">
          <div className="page-header">
            <h1 className="page-title">עגלת קניות</h1>
          </div>

          <div className="cart-main">
            {cartItems.length === 0 ? (
              <div className="empty-state">
                <p className="empty-message">בקרוב יהיו כאן פריטים</p>
              </div>
            ) : (
              <div className="cart-content">
                <div className="cart-items">
                  {cartItems.map(cartItem => (
                    <div key={cartItem.item.id} className="cart-item">
                      <div className="item-header">
                        <h3 className="item-name">{cartItem.item.name}</h3>
                        <button
                          onClick={() => removeFromCart(cartItem.item.id)}
                          className="action-button danger"
                          title="הסר מהעגלה"
                        >
                          <img className='icon small' src='/assets/Icons/delete.svg' alt='הסר'/>                          
                        </button>
                      </div>
                      
                      <div className="item-details">
                        <PriceDisplay 
                          prices={cartItem.item.prices}
                          currentPrice={cartItem.item.currentPrice}
                          size="md"
                          showLabels={true}
                        />
                        <div className="quantity-controls">
                          <button
                            onClick={() => updateCartItemQuantity(cartItem.item.id, cartItem.quantity - 1)}
                            className="action-button secondary"
                            disabled={cartItem.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="quantity-display">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItemQuantity(cartItem.item.id, cartItem.quantity + 1)}
                            className="action-button secondary"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="item-total">
                        סה"כ לפריט: ₪{(cartItem.item.currentPrice * cartItem.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="checkout-section">
                  <div className="total-summary">
                    <span className="total-label">סה"כ לתשלום:</span>
                    <span className="total-amount">₪{getTotalPrice().toFixed(2)}</span>
                  </div>
                  
                  <button
                    onClick={handlePayment}
                    className="action-button"
                  >
                    בצע תשלום
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;