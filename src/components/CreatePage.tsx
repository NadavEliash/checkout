import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import UserMenu from './UserMenu';
import ItemForm from './ItemForm';
import ItemsList from './ItemsList';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { items, addItem, updateItem, deleteItem, reorderItems } = useItems();

  const handleBackToMain = () => {
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-app-background)',
      color: 'var(--color-gray-800)'
    }} dir="rtl">
      <div style={{
        maxWidth: 'var(--container-lg)',
        margin: '0 auto',
        padding: 'var(--spacing-lg)'
      }}>
        <header style={{
          background: 'var(--color-white-transparent)',
          padding: 'var(--spacing-3xl)',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--spacing-2xl)',
          boxShadow: 'var(--shadow-xl)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--spacing-2xl)'
          }}>
            <button
              onClick={handleBackToMain}
              style={{
                padding: 'var(--spacing-md) var(--spacing-xl)',
                backgroundColor: 'var(--color-info)',
                color: 'var(--color-white)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 'var(--font-semibold)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                transition: 'all var(--transition-normal)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-info-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-info)'}
            >
              חזור לעמוד הבית
            </button>
            <UserMenu />
          </div>
          <div style={{
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: 'var(--font-4xl)',
              color: 'var(--color-gray-700)',
              marginBottom: 'var(--spacing-md)',
              fontWeight: 'var(--font-bold)'
            }}>יצירת פריטים</h1>
            <p style={{
              fontSize: 'var(--font-lg)',
              color: 'var(--color-gray-600)',
              fontWeight: 'var(--font-light)'
            }}>הוסף פריטים חדשים למכירה</p>
          </div>
        </header>

        <main>
          <ItemForm onAddItem={addItem} />
          <ItemsList items={items} onUpdateItem={updateItem} onDeleteItem={deleteItem} onReorderItems={reorderItems} />
        </main>
      </div>
    </div>
  );
};

export default CreatePage;