import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import UserMenu from './UserMenu';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { items } = useItems();

  const handleNavigateToCreate = () => {
    navigate('/create');
  };

  const handleNavigateToSell = () => {
    navigate('/sell');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-gray-800 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto p-5">
        <header className="bg-white/95 p-10 rounded-2xl mb-8 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div></div>
            <UserMenu />
          </div>
          <div className="text-center flex justify-center gap-10">
            <div className="flex flex-col">
              <h1 className="text-5xl text-gray-700 mb-3 font-bold">צ'קאאוט</h1>
              <p className="text-xl text-gray-600 font-light">פשוט למכור</p>
            </div>
            <img className="w-16" src="/assets/checkout.svg" alt="עגלת קניות" />
          </div>
        </header>

        <div className="flex flex-col items-center space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">ברוכים הבאים לצ'קאאוט</h2>
            <p className="text-lg text-white/90">הפלטפורמה הפשוטה למכירת פריטים</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            <div className="bg-white/95 p-8 rounded-2xl shadow-xl text-center">
              <h3 className="text-xl font-bold mb-4 text-gray-700">יצירת פריטים</h3>
              <p className="text-gray-600 mb-6">הוסף פריטים חדשים למכירה</p>
              <button
                onClick={handleNavigateToCreate}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full"
              >
                צור פריטים ({items.length})
              </button>
            </div>

            <div className="bg-white/95 p-8 rounded-2xl shadow-xl text-center">
              <h3 className="text-xl font-bold mb-4 text-gray-700">מכירת פריטים</h3>
              <p className="text-gray-600 mb-6">בחר פריטים למכירה והמשך לתשלום</p>
              <button
                onClick={handleNavigateToSell}
                disabled={items.length === 0}
                className={`px-6 py-3 rounded-lg font-semibold w-full transition-colors ${
                  items.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                מכור פריטים
              </button>
            </div>
          </div>

          {items.length === 0 && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 max-w-md text-center">
              <p className="text-yellow-800">
                צור פריטים כדי להתחיל למכור
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;