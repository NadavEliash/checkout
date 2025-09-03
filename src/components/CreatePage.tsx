import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import Layout from './Layout';
import ItemForm from './ItemForm';
import ItemsList from './ItemsList';
import './CreatePage.css';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { items, addItem, updateItem, deleteItem, reorderItems } = useItems();

  const handleBackToMain = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="create-page">
        <div className="create-container">
          <div className="page-header">
            <h1 className="page-title">יצירת פריטים</h1>
            <p className="page-description">הוסף פריטים חדשים למכירה</p>
          </div>

          <div className="create-main">
            <ItemForm onAddItem={addItem} />
            <ItemsList items={items} onUpdateItem={updateItem} onDeleteItem={deleteItem} onReorderItems={reorderItems} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreatePage;