import React, { useState, useEffect } from 'react';

// Mock order data for placeholder
const mockUserOrders = [
  { orderId: 'ORD789', date: '2023-10-26', totalAmount: 75.99, status: 'Delivered' },
  { orderId: 'ORD456', date: '2023-11-15', totalAmount: 120.50, status: 'Shipped' },
  { orderId: 'ORD123', date: '2023-11-20', totalAmount: 35.00, status: 'Processing' },
];

function UserDashboardPage({ navigateTo }) { // navigateTo for any internal navigation
  const [orders, setOrders] = useState([]);

  // Conceptual useEffect for fetching user orders
  useEffect(() => {
    // In a real application, this would be a fetch call to an authenticated endpoint:
    // const fetchOrders = async () => {
    //   try {
    //     // const response = await fetch('/api/user/orders', {
    //     //   headers: {
    //     //     // Assuming a token-based authentication (e.g., JWT)
    //     //     'Authorization': `Bearer YOUR_AUTH_TOKEN_HERE`,
    //     //   },
    //     // });
    //     // if (!response.ok) {
    //     //   throw new Error('Failed to fetch orders');
    //     // }
    //     // const data = await response.json();
    //     // setOrders(data);
    //
    //     // For now, using mock data
    //     setOrders(mockUserOrders);
    //     console.log('UserDashboardPage: Conceptually fetched orders.');
    //   } catch (error) {
    //     console.error('Error fetching orders (conceptual):', error);
    //     // Handle error (e.g., show error message to user)
    //   }
    // };
    // fetchOrders();

    // Simulating the fetch call with mock data
    setOrders(mockUserOrders);
    console.log('UserDashboardPage: Set mock orders in useEffect.');
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div>
      <h2>My Dashboard</h2>

      <section style={{ marginTop: '20px', marginBottom: '30px' }}>
        <h3>My Past Orders</h3>
        {orders.length === 0 ? (
          <p>You have no past orders.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {orders.map(order => (
              <li key={order.orderId} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
                <div><strong>Order ID:</strong> {order.orderId}</div>
                <div><strong>Date:</strong> {order.date}</div>
                <div><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</div>
                <div><strong>Status:</strong> {order.status}</div>
                {/* Conceptual: <button onClick={() => navigateTo('orderDetails', { orderId: order.orderId })}>View Details</button> */}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>My Profile</h3>
        <p>Coming Soon - Manage your profile details here.</p>
        {/* Placeholder for profile management, address book, etc. */}
      </section>

      {/* Conceptual button to go back to shop */}
      {navigateTo && (
         <button onClick={() => navigateTo('shop')} style={{ marginTop: '20px' }}>
          Back to Shop
        </button>
      )}
    </div>
  );
}

export default UserDashboardPage;
