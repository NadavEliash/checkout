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
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
      >
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name} 
          />
        ) : (
          <div>
            <span>
              {user.name === 'אורח' ? '👤' : user.name.charAt(0)}
            </span>
          </div>
        )}
        <span>{user.name}</span>
        <svg 
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
 
            onClick={() => setIsOpen(false)}
          />
          <div>
            <div>
              <div>
                {user.name}
              </div>
              {user.email && (
                <div>
                  {user.email}
                </div>
              )}
              {isGuest ? (
                <>
                  <button
                    onClick={handleLogin}
                  >
                    התחבר
                  </button>
                  <button
                    onClick={handleRemoveAllData}
                  >
                    מחק את כל הנתונים
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogout}
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