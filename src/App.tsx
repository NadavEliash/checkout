import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ItemsProvider } from './context/ItemsContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';
import CreatePage from './components/CreatePage';
import SellPage from './components/SellPage';
import CartPage from './components/CartPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ItemsProvider>
      <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <CreatePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sell" 
            element={
              <ProtectedRoute>
                <SellPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ItemsProvider>
    </AuthProvider>
  );
};

export default App;