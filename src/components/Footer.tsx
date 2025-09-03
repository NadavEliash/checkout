import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const pages = [
    { path: '/', label: 'בית' },
    { path: '/create', label: 'רשימה' },
    { path: '/sell', label: 'דף מכירה' },
    { path: '/cart', label: 'דף תשלום' }
  ];
  
  const currentIndex = pages.findIndex(page => page.path === currentPath);
  
  const getPageStatus = (index: number) => {
    if (index === currentIndex) return 'current';
    if (index === currentIndex - 1) return 'previous';
    if (index === currentIndex + 1) return 'next';
    return 'inactive';
  };
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <nav className="footer-nav">
          {pages.map((page, index) => (
            <Link 
              key={page.path}
              to={page.path} 
              className={`footer-link ${getPageStatus(index)}`}
            >
              <span className="footer-link-text">{page.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;