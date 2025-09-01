import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import UserMenu from './UserMenu';
import ItemForm from './ItemForm';
import ItemsList from './ItemsList';
import styles from './CreatePage.module.css';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { items, addItem, updateItem, deleteItem, reorderItems } = useItems();

  const handleBackToMain = () => {
    navigate('/');
  };

  return (
    <div className={styles['create-page']} dir="rtl">
      <div className={styles['create-page-content']}>
        <header className={styles['create-page-header']}>
          <div className={styles['header-navigation']}>
            <button
              onClick={handleBackToMain}
              className={styles['back-to-home-button']}
            >
              חזור לעמוד הבית
            </button>
            <UserMenu />
          </div>
          <div className={styles['page-title-section']}>
            <h1 className={styles['page-title']}>יצירת פריטים</h1>
            <p className={styles['page-subtitle']}>הוסף פריטים חדשים למכירה</p>
          </div>
        </header>

        <main className={styles['create-page-main']}>
          <ItemForm onAddItem={addItem} />
          <ItemsList items={items} onUpdateItem={updateItem} onDeleteItem={deleteItem} onReorderItems={reorderItems} />
        </main>
      </div>
    </div>
  );
};

export default CreatePage;