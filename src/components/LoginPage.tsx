import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsGuest, loginWithGoogle, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

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
    <div className={styles['login-page']} dir="rtl">
      <div className={styles['login-container']}>
        <div className={styles['login-card']}>
            <div className={styles['app-logo']}>
              <img src="/assets/Icons/cart.svg" alt="עגלה" className={styles['logo-icon']}/>
            </div>
          <div className={styles['login-title-section']}>
            <h1 className={styles['login-title']}>חשבון בבקשה</h1>
          </div>

          <div className={styles['login-form-section']}>
            <h2 className={styles['welcome-message']}>ברוכים הבאים</h2>
            
            {error && (
              <div className={styles['error-message']}>
                {error}
              </div>
            )}
            
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={`${styles['google-login-button']} ${
                isLoading 
                  ? styles['button-loading'] 
                  : styles['button-enabled']
              }`}
            >
              {isLoading ? (
                <div className={styles['loading-spinner']} />
              ) : (
                <svg className={styles['google-icon']} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isLoading ? 'מתחבר...' : 'המשך עם Google'}
            </button>

            <div className={styles['divider-section']}>
              <div className={styles['divider-line']}></div>
              <span className={styles['divider-text']}>או</span>
              <div className={styles['divider-line']}></div>
            </div>
            
            {/* Guest Login Section */}
            <div className={styles['guest-login-section']}>
              <button
                onClick={handleGuestLogin}
                disabled={isLoading}
                className={`${styles['guest-login-button']} ${
                  isLoading 
                    ? styles['button-loading'] 
                    : styles['button-enabled']
                }`}
              >
                {isLoading ? (
                  <div className={styles['button-content-loading']}>
                    <div className={styles['loading-spinner-white']} />
                    <span>מתחבר...</span>
                  </div>
                ) : (
                  <div className={styles['button-content']}>
                    <svg className={styles['guest-login-icon']} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>כנס כאורח</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className={styles['security-info']}>
            <div className={styles['security-message']}>
              <svg className={styles['security-icon']} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>המידע שלך נשמר בבטחה</span>
            </div>
          </div>

          <div className={styles['terms-info']}>
            <p>על ידי המשך השימוש, אתה מסכים</p>
            <p>לתנאי השימוש ומדיניות הפרטיות</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;