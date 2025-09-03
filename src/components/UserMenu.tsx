import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clearAllData, clearAllDataFallback, isStorageSupported } from '../utils/indexedDB';
import './UserMenu.css';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const isGuest = user.name === 'אורח';
  
  const getInitials = (name: string) => {
    if (name === 'אורח') return 'א';
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0].charAt(0) + words[1].charAt(0);
    }
    return words[0].charAt(0);
  };

  const getGreeting = (name: string) => {
    if (name === 'אורח') return 'אורח';
    const firstName = name.split(' ')[0];
    return `שלום ${firstName}`;
  };

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
    <>
      {isOpen && <div className="dropdown-backdrop" onClick={() => setIsOpen(false)} />}
      <div className="dropdown-menu">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="action-button secondary user-menu-button"
        >
          <div className="avatar">
            {user.avatar ? (
              <>
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const initialsSpan = target.nextElementSibling as HTMLSpanElement;
                    if (initialsSpan) {
                      initialsSpan.style.display = 'flex';
                    }
                  }}
                />
                <span className="avatar-initials" style={{ display: 'none' }}>
                  {getInitials(user.name)}
                </span>
              </>
            ) : (
              <span className="avatar-initials">
                {getInitials(user.name)}
              </span>
            )}
          </div>
          <span>{getGreeting(user.name)}</span>
          <img className="icon small" src="/assets/Icons/arrow-down.svg" alt="v" />
        </button>

      <div className={`dropdown-menu-content ${isOpen ? 'open' : ''}`}>
        <div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/user');
                }}
                className="dropdown-menu-item"
              >
                החשבון שלי
              </button>
              {isGuest ? (
                <>
                  <button
                    onClick={handleLogin}
                    className="dropdown-menu-item"
                  >
                    התחבר
                  </button>
                  <button
                    onClick={handleRemoveAllData}
                    className="dropdown-menu-item danger"
                  >
                    מחק את כל הנתונים
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="dropdown-menu-item"
                >
                  התנתק
                </button>
              )}
        </div>
        </div>
      </div>
    </>
  );
};

export default UserMenu;