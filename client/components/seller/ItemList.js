import React from 'react';

// Placeholder for item structure - replace with actual data structure
const mockItems = [
  { id: '1', name: 'Item 1', description: 'Description 1', price: 10, imageUrl: 'url1' },
  { id: '2', name: 'Item 2', description: 'Description 2', price: 20, imageUrl: 'url2' },
];

function ItemList() {
  // TODO: Fetch items for the logged-in seller
  // const [items, setItems] = useState([]);
  // useEffect(() => { /* fetch items logic */ }, []);

  const handleEdit = (itemId) => {
    console.log('Edit item:', itemId);
    // TODO: Logic to show EditItemForm for this item
  };

  const handleDelete = (itemId) => {
    console.log('Delete item:', itemId);
    // TODO: Logic to call delete API and update list
  };

  return (
    <div>
      <h3>My Items</h3>
      {mockItems.length === 0 && <p>You haven't added any items yet.</p>}
      <ul>
        {mockItems.map(item => (
          <li key={item.id} style={{ borderBottom: '1px solid #ccc', marginBottom: '10px', paddingBottom: '10px' }}>
            {/* Placeholder for item details */}
            <h4>{item.name}</h4>
            <p>{item.description}</p>
            <p>Price: ${item.price}</p>
            {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ maxWidth: '100px', maxHeight: '100px' }} />}
            <div>
              {/* Placeholder for edit/delete buttons */}
              <button onClick={() => handleEdit(item.id)}>Edit</button>
              <button onClick={() => handleDelete(item.id)} style={{ marginLeft: '10px' }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ItemList;
