import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import UserMenu from './UserMenu';
import PriceDisplay from './PriceDisplay';
import styles from './CartPage.module.css';

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
    <div className={styles['cart-page']} dir="rtl">
      <div className={styles['cart-page-content']}>
        <div className={styles['cart-page-header']}>
          <div className={styles['navigation-links']}>
            <button
              onClick={() => navigate('/')}
              className={styles['back-to-home-link']}
            >
              ← עמוד הבית
            </button>
            <button
              onClick={handleBackToSell}
              className={styles['back-to-sell-link']}
            >
              | דף מכירות
            </button>
          </div>
          <h1 className={styles['cart-page-title']}>עגלת קניות</h1>
          <UserMenu />
        </div>

        {cartItems.length === 0 ? (
          <p className={styles['empty-cart-message']}>אין פריטים בעגלה</p>
        ) : (
          <div className={styles['cart-content']}>
            <div className={styles['cart-items-list']}>
              {cartItems.map(cartItem => (
                <div key={cartItem.item.id} className={styles['cart-item-card']}>
                  <div className={styles['cart-item-header']}>
                    <h3 className={styles['cart-item-name']}>{cartItem.item.name}</h3>
                    <button
                      onClick={() => removeFromCart(cartItem.item.id)}
                      className={styles['remove-item-button']}
                      title="הסר מהעגלה"
                    >
                      <svg className={styles['remove-icon']} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className={styles['cart-item-details']}>
                    <PriceDisplay 
                      prices={cartItem.item.prices}
                      currentPrice={cartItem.item.currentPrice}
                      size="md"
                      showLabels={true}
                    />
                    <div className={styles['quantity-controls']}>
                      <button
                        onClick={() => updateCartItemQuantity(cartItem.item.id, cartItem.quantity - 1)}
                        className={styles['quantity-decrease-button']}
                        disabled={cartItem.quantity <= 1}
                      >
                        -
                      </button>
                      <span className={styles['quantity-display']}>
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItemQuantity(cartItem.item.id, cartItem.quantity + 1)}
                        className={styles['quantity-increase-button']}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles['item-total-price']}>
                    סה"כ לפריט: ₪{(cartItem.item.currentPrice * cartItem.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles['cart-summary']}>
              <div className={styles['total-section']}>
                <span className={styles['total-label']}>סה"כ לתשלום:</span>
                <span className={styles['total-amount']}>₪{getTotalPrice().toFixed(2)}</span>
              </div>
              
              <button
                onClick={handlePayment}
                className={styles['payment-button']}
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