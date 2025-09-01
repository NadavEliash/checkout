import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clearAllData, clearAllDataFallback, isStorageSupported } from '../utils/indexedDB';
import styles from './UserMenu.module.css';

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
    <div className={styles['user-menu-container']}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles['user-menu-trigger']}
      >
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name} 
            className={styles['user-avatar']}
          />
        ) : (
          <div className={styles['user-avatar-placeholder']}>
            <span className={styles['avatar-initials']}>
              {user.name === 'אורח' ? '👤' : user.name.charAt(0)}
            </span>
          </div>
        )}
        <span className={styles['user-display-name']}>{user.name}</span>
        <svg 
          className={`${styles['dropdown-arrow']} ${isOpen ? styles['arrow-open'] : ''}`}
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
            className={styles['menu-backdrop']} 
            onClick={() => setIsOpen(false)}
          />
          <div className={styles['user-menu-dropdown']}>
            <div className={styles['menu-content']}>
              <div className={styles['menu-user-info']}>
                {user.name}
              </div>
              {user.email && (
                <div className={styles['menu-user-email']}>
                  {user.email}
                </div>
              )}
              {isGuest ? (
                <>
                  <button
                    onClick={handleLogin}
                    className={styles['menu-login-button']}
                  >
                    התחבר
                  </button>
                  <button
                    onClick={handleRemoveAllData}
                    className={styles['menu-clear-data-button']}
                  >
                    מחק את כל הנתונים
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className={styles['menu-logout-button']}
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