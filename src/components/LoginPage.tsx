import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsGuest, loginWithGoogle, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const handleGuestLogin = async () => {
    try {
      setError(null);
      await loginAsGuest('אורח');
      // Navigate to main page after successful login
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'כניסה נכשלה. אנא נסה שוב.');
      console.error('Guest login error:', err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await loginWithGoogle();
      // Navigate to main page after successful login
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'כניסה עם Google נכשלה. אנא נסה שוב.');
      console.error('Google login error:', err);
    }
  };


  return (
    <div className="login-page" dir="rtl">
      <div className="login-container">
        <div className="login-card">
            <div className="login-logo">
              <img src="/assets/Icons/cart.svg" alt="עגלה" />
            </div>
          <div className="login-header">
            <h1 className="login-title">חשבון בבקשה</h1>
          </div>

          <div className="login-form">
            <h2 className="welcome-title">ברוכים הבאים</h2>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              onMouseEnter={() => setHoveredButton('google')}
              onMouseLeave={() => setHoveredButton(null)}
              className="action-button secondary"
            >
              {isLoading ? (
                <div />
              ) : (
                <img className='icon small' src='/assts/Icons/google.svg' alt='G'/>
              )}
              {isLoading ? 'מתחבר...' : 'המשך עם Google'}
            </button>

            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">או</span>
              <div className="divider-line"></div>
            </div>
            
            {/* Guest Login Section */}
            <div className="guest-login-section">
              <button
                onClick={handleGuestLogin}
                disabled={isLoading}
                onMouseEnter={() => setHoveredButton('guest')}
                onMouseLeave={() => setHoveredButton(null)}
                className="action-button"
              >
                {isLoading ? (
                  <div className="button-loading">
                    <div className="loading-spinner" />
                    <span>מתחבר...</span>
                  </div>
                ) : (
                  <div className="button-content">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    <span>כנס כאורח</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="security-notice">
            <div className="security-info">
              <img className='icon small' src='/assts/Icons/lock.svg' alt='נעול'/>
              <span>המידע שלך נשמר בבטחה</span>
            </div>
          </div>

          <div className="terms-notice">
            <p>על ידי המשך השימוש, אתה מסכים</p>
            <p>לתנאי השימוש ומדיניות הפרטיות</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;