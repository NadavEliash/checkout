import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import Layout from './Layout';
import './MainPage.css';

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
    <Layout>
      <div className="main-page">
        <div className="main-container">
          <div className="hero-section">
            <p className="app-subtitle">פשוט למכור</p>
          </div>

          <div className="feature-cards">
            <div className="feature-card">
              <div className="card-header">
                <h3 className="card-title">רשימת הפריטים</h3>
              </div>
              <p className="card-description">הוסף פריטים למכירה</p>
              <button
                onClick={handleNavigateToCreate}
                className="action-button"
              >
                <p>ליצור ({items.length})</p>
                <img src="/assets/Icons/list.svg" alt="רשימה" className="icon" />
              </button>
            </div>

            <div className="feature-card">
              <div className="card-header">
                <h3 className="card-title">דף מכירה</h3>
              </div>
              <p className="card-description">בחר פריטים מהרשימה ליצירת דף תשלום ללקוח</p>
              <button
                onClick={handleNavigateToSell}
                disabled={items.length === 0}
                className="action-button"
              >
                למכור
              </button>
            </div>
          </div>

          {items.length === 0 && (
            <div className="empty-state">
              <p className="empty-message">
                צור פריטים כדי להתחיל למכור
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MainPage;