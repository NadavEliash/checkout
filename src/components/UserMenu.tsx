import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clearAllData, clearAllDataFallback, isStorageSupported } from '../utils/indexedDB';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const isGuest = user.name === 'אורח';

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const handleLogin = () => {
    setIsOpen(false);
    navigate('/login');
  };

  const handleRemoveAllData = async () => {
    setIsOpen(false);
    try {
      const indexedDBSupported = isStorageSupported();
      if (indexedDBSupported) {
        try {
          await clearAllData();
        } catch (error) {
          console.warn('IndexedDB failed, falling back to localStorage:', error);
          clearAllDataFallback();
        }
      } else {
        clearAllDataFallback();
      }
      // Reload the page to reset the app state
      window.location.reload();
    } catch (error) {
      console.error('Failed to remove all data:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:text-gray-900 transition-colors"
      >
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">
              {user.name === 'אורח' ? '👤' : user.name.charAt(0)}
            </span>
          </div>
        )}
        <span className="font-medium">{user.name}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
            <div className="py-2">
              <div className="px-4 py-2 text-sm text-gray-500 border-b">
                {user.name}
              </div>
              {user.email && (
                <div className="px-4 py-2 text-sm text-gray-600">
                  {user.email}
                </div>
              )}
              {isGuest ? (
                <>
                  <button
                    onClick={handleLogin}
                    className="w-full text-right px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    התחבר
                  </button>
                  <button
                    onClick={handleRemoveAllData}
                    className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    מחק את כל הנתונים
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  התנתק
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;