import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-app-background)',
      color: 'var(--color-gray-800)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-lg)'
    }} dir="rtl">
      <div style={{
        width: '100%',
        maxWidth: 'var(--container-sm)'
      }}>
        <div style={{
          background: 'var(--color-white-transparent)',
          padding: 'var(--spacing-3xl)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)'
        }}>
            <div style={{
              textAlign: 'center',
              marginBottom: 'var(--spacing-2xl)'
            }}>
              <img src="/assets/Icons/cart.svg" alt="עגלה" style={{
                width: '4rem',
                height: '4rem',
                margin: '0 auto'
              }}/>
            </div>
          <div style={{
            textAlign: 'center',
            marginBottom: 'var(--spacing-2xl)'
          }}>
            <h1 style={{
              fontSize: 'var(--font-4xl)',
              color: 'var(--color-gray-700)',
              marginBottom: 'var(--spacing-md)',
              fontWeight: 'var(--font-bold)'
            }}>חשבון בבקשה</h1>
          </div>

          <div style={{
            width: '100%'
          }}>
            <h2 style={{
              fontSize: 'var(--font-xl)',
              color: 'var(--color-gray-600)',
              marginBottom: 'var(--spacing-xl)',
              textAlign: 'center'
            }}>ברוכים הבאים</h2>
            
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid var(--color-error)',
                color: 'var(--color-error)',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-lg)',
                fontSize: 'var(--font-sm)'
              }}>
                {error}
              </div>
            )}
            
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              onMouseEnter={() => setHoveredButton('google')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                width: '100%',
                padding: 'var(--spacing-lg)',
                backgroundColor: isLoading ? 'var(--color-gray-300)' : 'var(--color-white)',
                color: isLoading ? 'var(--color-gray-500)' : 'var(--color-gray-800)',
                border: '2px solid var(--color-gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-base)',
                fontWeight: 'var(--font-semibold)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-lg)',
                transition: 'all var(--transition-normal)',
                opacity: hoveredButton === 'google' && !isLoading ? 0.9 : 1,
                transform: hoveredButton === 'google' && !isLoading ? 'translateY(-1px)' : 'none'
              }}
            >
              {isLoading ? (
                <div style={{
                  width: 'var(--spacing-2xl)',
                  height: 'var(--spacing-2xl)',
                  border: '2px solid var(--color-gray-300)',
                  borderTop: '2px solid var(--color-primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <svg style={{
                  width: '1.5rem',
                  height: '1.5rem'
                }} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isLoading ? 'מתחבר...' : 'המשך עם Google'}
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: 'var(--spacing-xl) 0'
            }}>
              <div style={{
                flex: 1,
                height: '1px',
                backgroundColor: 'var(--color-gray-300)'
              }}></div>
              <span style={{
                padding: '0 var(--spacing-lg)',
                color: 'var(--color-gray-500)',
                fontSize: 'var(--font-sm)'
              }}>או</span>
              <div style={{
                flex: 1,
                height: '1px',
                backgroundColor: 'var(--color-gray-300)'
              }}></div>
            </div>
            
            {/* Guest Login Section */}
            <div>
              <button
                onClick={handleGuestLogin}
                disabled={isLoading}
                onMouseEnter={() => setHoveredButton('guest')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-lg)',
                  background: isLoading 
                    ? 'var(--color-gray-300)' 
                    : (hoveredButton === 'guest' ? 'var(--gradient-primary-hover)' : 'var(--gradient-primary)'),
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-base)',
                  fontWeight: 'var(--font-semibold)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--spacing-md)',
                  marginBottom: 'var(--spacing-xl)',
                  transition: 'all var(--transition-normal)'
                }}
              >
                {isLoading ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)'
                  }}>
                    <div style={{
                      width: 'var(--spacing-lg)',
                      height: 'var(--spacing-lg)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid var(--color-white)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <span>מתחבר...</span>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)'
                  }}>
                    <svg style={{
                      width: '1.25rem',
                      height: '1.25rem'
                    }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>כנס כאורח</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-sm)',
              color: 'var(--color-gray-600)',
              fontSize: 'var(--font-sm)'
            }}>
              <svg style={{
                width: '1rem',
                height: '1rem'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>המידע שלך נשמר בבטחה</span>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            color: 'var(--color-gray-500)',
            fontSize: 'var(--font-sm)',
            lineHeight: 'var(--leading-relaxed)'
          }}>
            <p>על ידי המשך השימוש, אתה מסכים</p>
            <p>לתנאי השימוש ומדיניות הפרטיות</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;