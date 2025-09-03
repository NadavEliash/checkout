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
    <div>
      <div>
        <div></div>
        <p>מתחבר...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;