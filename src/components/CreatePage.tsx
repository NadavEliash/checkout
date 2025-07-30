import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import UserMenu from './UserMenu';
import ItemForm from './ItemForm';
import ItemsList from './ItemsList';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { items, addItem, deleteItem, reorderItems } = useItems();

  const handleBackToMain = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-gray-800 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto p-5">
        <header className="bg-white/95 p-10 rounded-2xl mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToMain}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              ← חזור לעמוד הבית
            </button>
            <UserMenu />
          </div>
          <div className="text-center">
            <h1 className="text-4xl text-gray-700 mb-3 font-bold">יצירת פריטים</h1>
            <p className="text-lg text-gray-600 font-light">הוסף פריטים חדשים למכירה</p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ItemForm onAddItem={addItem} />
          <ItemsList items={items} onDeleteItem={deleteItem} onReorderItems={reorderItems} />
        </main>
      </div>
    </div>
  );
};

export default CreatePage;