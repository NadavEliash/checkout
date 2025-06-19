import React from 'react';

// This component would be navigated to after a successful payment.
// It might receive order details via props or fetch them based on an order ID from URL/state.
function PaymentSuccessPage({ orderDetails, navigateTo }) { // navigateTo for going back to shop
  // In a real application, 'orderDetails' might come from React Router's location state,
  // or this page might fetch order details using an ID from the URL query params.
  // Example: const { orderId, method } = useLocation().state || {};

  const displayOrderId = orderDetails?.orderId || 'N/A';
  const paymentMethod = orderDetails?.method || 'your payment method';

  return (
    <div>
      <h2>Payment Successful!</h2>
      <p>Thank you for your order.</p>
      <p>
        Your payment with {paymentMethod} for order ID: <strong>{displayOrderId}</strong> was processed successfully.
      </p>
      {/*
        In a real application:
        1. The `displayOrderId` would ideally be confirmed from server data (e.g., fetched based on a transaction ID
           returned by the payment gateway's redirect if not passed reliably via state).
        2. This page could make a `fetch` call to an endpoint like `/api/orders/:orderId`
           to get the latest order details and display a more comprehensive summary
           (items, shipping info, final amount confirmed by server).
        3. This ensures the user sees the most accurate and confirmed information.
      */}
      <p>
        A confirmation email has been conceptually sent. In a real application, this page
        might display more detailed order information, which could be fetched from the server
        using the order ID (e.g., `/api/orders/${displayOrderId}`).
      </p>
      {/* Conceptual button to go back to shop */}
      {navigateTo && (
        <button onClick={() => navigateTo('shop')} style={{ marginTop: '20px' }}>
          Continue Shopping
        </button>
      )}
    </div>
  );
}

export default PaymentSuccessPage;
