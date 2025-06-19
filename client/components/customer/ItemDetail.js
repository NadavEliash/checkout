import React from 'react';
// import { useCart } from '../../contexts/CartContext'; // Conceptual: Import CartContext

// Placeholder for item structure - replace with actual data from API
const mockItem = {
  id: '101',
  name: 'Cool Gadget',
  description: 'This is a really cool gadget that does amazing things. You definitely want it!',
  price: 49.99,
  imageUrl: 'url_gadget_large',
  // Could have more details: specifications, reviews, etc.
};

function ItemDetail({ itemId }) { // itemId would likely come from URL params in a real app
  // const { addItemToCart } = useCart(); // Conceptual
  // TODO: Fetch item details from API based on itemId
  // const [item, setItem] = useState(null);
  // useEffect(() => { /* fetch item details logic using itemId */ setItem(mockItem); }, [itemId]);

  const item = mockItem; // Using mock item for placeholder

  const handleAddToCart = (itemToAdd) => {
    console.log('Adding to cart (conceptual):', itemToAdd);
    // addItemToCart(itemToAdd); // Conceptual
    alert(`${itemToAdd.name} added to cart (placeholder)!`);
  };

  if (!item) {
    return <p>Loading item details...</p>; // Or item not found
  }

  return (
    <div>
      <h2>{item.name}</h2>
      {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ maxWidth: '400px', height: 'auto', marginBottom: '20px' }} />}
      <p>{item.description}</p>
      <p>Price: ${item.price}</p>
      {/* Placeholder for "Add to Cart" button */}
      <button onClick={() => handleAddToCart(item)}>Add to Cart</button>
      {/* Could have related products, reviews, etc. here */}
    </div>
  );
}

export default ItemDetail;
