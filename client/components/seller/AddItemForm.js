import React, { useState } from 'react';

function AddItemForm({ onFormSubmit }) { // onFormSubmit is a conceptual prop to handle submission
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual item adding logic (e.g., API call)
    console.log('Adding item:', { name, description, price, imageUrl });
    // if (onFormSubmit) onFormSubmit({ name, description, price, imageUrl }); // Call parent handler
    setName('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    alert('Item added (placeholder)!'); // Placeholder feedback
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add New Item</h3>
      <div>
        <label htmlFor="item-name">Name:</label>
        <input
          type="text"
          id="item-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="item-description">Description:</label>
        <textarea
          id="item-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="item-price">Price:</label>
        <input
          type="number"
          id="item-price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="0"
        />
      </div>
      <div>
        <label htmlFor="item-imageUrl">Image URL (optional):</label>
        <input
          type="url"
          id="item-imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>
      <button type="submit">Add Item</button>
    </form>
  );
}

export default AddItemForm;
