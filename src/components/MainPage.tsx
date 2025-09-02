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
    <div dir="rtl">
      <div>
        <header>
          <div>
            <UserMenu />
            <div></div>
          </div>
          <div>
            <div>
              <h1>חשבון, בבקשה!</h1>
              <p>פשוט למכור</p>
            </div>
          </div>
        </header>

        <div>

          <div>
            <div>
              <div>
                <h3>רשימת הפריטים</h3>
              </div>
              <p>הוסף פריטים למכירה</p>
              <button
                onClick={handleNavigateToCreate}
              >
                <p>ליצור ({items.length})</p>
                <img src="/assets/Icons/list.svg" alt="רשימה" />
              </button>
            </div>

            <div>
              <div>
                <h3>דף מכירה</h3>
              </div>
              <p>בחר פריטים מהרשימה ליצירת דף תשלום ללקוח</p>
              <button
                onClick={handleNavigateToSell}
                disabled={items.length === 0}
              >
                למכור
              </button>
            </div>
          </div>

          {items.length === 0 && (
            <div>
              <p>
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