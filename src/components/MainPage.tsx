import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import UserMenu from './UserMenu';
import styles from './MainPage.module.css';

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
    <div className={styles['main-app-container']} dir="rtl">
      <div className={styles['main-content-wrapper']}>
        <header className={styles['main-header']}>
          <div className={styles['header-navigation']}>
            <UserMenu />
            <div></div>
          </div>
          <div className={styles['hero-section']}>
            <div className={styles['hero-content']}>
              <h1 className={styles['app-title']}>חשבון, בבקשה!</h1>
              <p className={styles['app-subtitle']}>פשוט למכור</p>
            </div>
          </div>
        </header>

        <div className={styles['features-container']}>

          <div className={styles['features-grid']}>
            <div className={styles['feature-section']}>
              <div className={styles['feature-header']}>
                <h3 className={styles['feature-title']}>רשימת הפריטים</h3>
              </div>
              <p className={styles['feature-description']}>הוסף פריטים למכירה</p>
              <button
                onClick={handleNavigateToCreate}
                className={styles['create-items-button']}
              >
                <p>ליצור ({items.length})</p>
                <img className={styles['button-icon']} src="/assets/Icons/list.svg" alt="רשימה" />
              </button>
            </div>

            <div className={styles['feature-section']}>
              <div className={styles['feature-header']}>
                <h3 className={styles['feature-title']}>דף מכירה</h3>
              </div>
              <p className={styles['feature-description']}>בחר פריטים מהרשימה ליצירת דף תשלום ללקוח</p>
              <button
                onClick={handleNavigateToSell}
                disabled={items.length === 0}
                className={`${styles['sell-items-button']} ${
                  items.length === 0
                    ? styles['button-disabled']
                    : styles['button-enabled']
                }`}
              >
                למכור
              </button>
            </div>
          </div>

          {items.length === 0 && (
            <div className={styles['empty-state-message']}>
              <p className={styles['warning-text']}>
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