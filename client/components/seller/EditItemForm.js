import React, { useState, useEffect } from 'react';

function EditItemForm({ item, onFormSubmit }) { // item and onFormSubmit are conceptual props
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Pre-fill form if an item is passed (conceptual)
    if (item) {
      setName(item.name || '');
      setDescription(item.description || '');
      setPrice(item.price || '');
      setImageUrl(item.imageUrl || '');
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual item update logic (e.g., API call)
    const updatedItem = { ...item, name, description, price, imageUrl };
    console.log('Updating item:', updatedItem);
    // if (onFormSubmit) onFormSubmit(updatedItem); // Call parent handler
    alert('Item updated (placeholder)!'); // Placeholder feedback
  };

  if (!item) {
    return <p>No item selected for editing.</p>; // Or some other placeholder
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Edit Item: {item.name}</h3>
      <div>
        <label htmlFor="edit-item-name">Name:</label>
        <input
          type="text"
          id="edit-item-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="edit-item-description">Description:</label>
        <textarea
          id="edit-item-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="edit-item-price">Price:</label>
        <input
          type="number"
          id="edit-item-price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="0"
        />
      </div>
      <div>
        <label htmlFor="edit-item-imageUrl">Image URL (optional):</label>
        <input
          type="url"
          id="edit-item-imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>
      <button type="submit">Save Changes</button>
    </form>
  );
}

export default EditItemForm;
