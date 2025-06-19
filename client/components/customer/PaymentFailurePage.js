import React from 'react';

// This component would be navigated to after a failed or cancelled payment.
function PaymentFailurePage({ orderDetails, navigateTo }) { // navigateTo for going back to checkout
  // 'orderDetails' might contain information like orderId, payment method, and reason for failure.
  // Example: const { orderId, method, reason } = useLocation().state || {};

  const displayOrderId = orderDetails?.orderId || 'N/A';
  const paymentMethod = orderDetails?.method || 'your payment method';
  const failureReason = orderDetails?.reason || 'Unknown reason';


  return (
    <div>
      <h2>Payment Failed</h2>
      <p>Unfortunately, your payment could not be processed at this time.</p>
      <p>
        Order ID: <strong>{displayOrderId}</strong> (using {paymentMethod})
      </p>
      <p>
        Reason: {failureReason}.
      </p>
      <p>
        Please try again or contact support if the issue persists.
      </p>

      {/* Conceptual button to go back to checkout */}
      {navigateTo && (
        <button onClick={() => navigateTo('checkout')} style={{ marginTop: '20px' }}>
          Try Again
        </button>
      )}
      {/* Conceptual button to go to shop */}
      {navigateTo && (
         <button onClick={() => navigateTo('shop')} style={{ marginTop: '20px', marginLeft: '10px' }}>
          Back to Shop
        </button>
      )}
    </div>
  );
}

export default PaymentFailurePage;
