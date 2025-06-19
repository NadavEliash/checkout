import React, { useState } from 'react';
import ItemList from './ItemList';
import AddItemForm from './AddItemForm';
// import EditItemForm from './EditItemForm'; // Conceptually, would also handle showing this

function SellerDashboard() {
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  // const [editingItem, setEditingItem] = useState(null); // Conceptual state for editing

  // Conceptual: Function to handle successful item submission from AddItemForm or EditItemForm
  // const handleFormSubmitted = () => {
  //   setShowAddItemForm(false);
  //   setEditingItem(null);
  //   // TODO: refresh item list
  // };

  // Conceptual: Function to set an item for editing
  // const handleEditItem = (item) => {
  //   setEditingItem(item);
  //   setShowAddItemForm(false); // Hide add form if showing
  //   // Logic to show EditItemForm would go here, perhaps a modal or swapping component
  // };

  return (
    <div>
      <h2>Seller Dashboard</h2>
      <button onClick={() => {
        setShowAddItemForm(!showAddItemForm);
        // setEditingItem(null); // Hide edit form if showing
      }}>
        {showAddItemForm ? 'Cancel Adding Item' : 'Add New Item'}
      </button>

      {/* Conceptual: Show AddItemForm or EditItemForm */}
      {showAddItemForm && <AddItemForm /* onFormSubmit={handleFormSubmitted} */ />}
      {/* {editingItem && <EditItemForm item={editingItem} onFormSubmit={handleFormSubmitted} />} */}

      <hr />
      <ItemList /* onEditItem={handleEditItem} */ />
    </div>
  );
}

export default SellerDashboard;
