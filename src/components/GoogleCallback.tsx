import React, { useEffect } from 'react';

const GoogleCallback: React.FC = () => {
  useEffect(() => {
    // Get authorization code from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (window.opener) {
      if (error) {
        // Send error to parent window
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error
        }, window.location.origin);
      } else if (code) {
        // Send success with code to parent window
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_SUCCESS',
          code: code
        }, window.location.origin);
      } else {
        // Send generic error
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: 'No authorization code received'
        }, window.location.origin);
      }
      
      // Close the popup
      window.close();
    } else {
      // Fallback if not in popup (direct navigation)
      window.location.href = '/login';
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-app-background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--color-white-transparent)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--spacing-2xl)',
        boxShadow: 'var(--shadow-xl)',
        textAlign: 'center'
      }}>
        <div style={{
          width: 'var(--spacing-2xl)',
          height: 'var(--spacing-2xl)',
          border: '3px solid var(--color-gray-300)',
          borderTop: '3px solid var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto var(--spacing-lg)'
        }}></div>
        <p style={{
          color: 'var(--color-gray-700)'
        }}>מתחבר...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;