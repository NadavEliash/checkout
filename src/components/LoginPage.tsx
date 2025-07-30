import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsGuest, isLoading } = useAuth();
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGuestLogin = async () => {
    try {
      setError(null);
      const name = guestName.trim() || 'אורח';
      await loginAsGuest(name);
      // Navigate to main page after successful login
      navigate('/');
    } catch (err) {
      setError('כניסה נכשלה. אנא נסה שוב.');
      console.error('Guest login error:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGuestLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center" dir="rtl">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/95 p-8 rounded-2xl shadow-xl text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-700 mb-2">צ'קאאוט</h1>
            <p className="text-lg text-gray-600">פשוט למכור</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">ברוכים הבאים</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="text-right">
                <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 mb-2">
                  איך נקרא לך? (אופציונלי)
                </label>
                <input
                  type="text"
                  id="guest-name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="השם שלך..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-right transition-colors"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  אם תשאיר ריק, נקרא לך "אורח"
                </p>
              </div>

              <button
                onClick={handleGuestLogin}
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  isLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>מתחבר...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>כנס לאפליקציה</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-center space-x-2 space-x-reverse text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>המידע שלך נשמר בבטחה במכשיר</span>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>על ידי המשך השימוש, אתה מסכים</p>
            <p>לתנאי השימוש ומדיניות הפרטיות</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;