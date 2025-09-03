import React from 'react';
import UserMenu from './UserMenu';
import Footer from './Footer';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout" dir="rtl">
      <header className="layout-header">
        <div className="layout-header-container">
          <h1 className="layout-title">חשבון, בבקשה!</h1>
          <div className="layout-user-menu">
            <UserMenu />
          </div>
        </div>
      </header>
      
      <main className="layout-main">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;