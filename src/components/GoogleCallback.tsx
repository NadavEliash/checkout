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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white/95 p-8 rounded-2xl shadow-xl text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-700">מתחבר...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;