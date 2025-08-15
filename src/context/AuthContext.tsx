import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import apiService, { User, UserResponse } from '../services/api';
import { 
  getUserData, 
  setUserData, 
  clearAllData,
  isStorageSupported,
  getUserDataFallback,
  setUserDataFallback,
  clearAllDataFallback
} from '../utils/indexedDB';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsGuest: (name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearAllAppData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useIndexedDB, setUseIndexedDB] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if IndexedDB is supported
        const indexedDBSupported = isStorageSupported();
        setUseIndexedDB(indexedDBSupported);

        let savedUserData: { user: User; token: any } | null = null;

        if (indexedDBSupported) {
          try {
            savedUserData = await getUserData();
          } catch (error) {
            console.warn('IndexedDB failed, falling back to localStorage:', error);
            savedUserData = getUserDataFallback();
            setUseIndexedDB(false);
          }
        } else {
          savedUserData = getUserDataFallback();
        }

        if (savedUserData && savedUserData.user && savedUserData.token) {
          // Set token in API service
          apiService.setToken(savedUserData.token.access_token);
          
          try {
            // Verify user with backend
            const currentUser = await apiService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            console.error('Failed to verify user with backend:', error);
            // Token might be expired, try to refresh
            try {
              await apiService.refreshToken();
              const currentUser = await apiService.getCurrentUser();
              setUser(currentUser);
            } catch (refreshError) {
              console.error('Failed to refresh token:', refreshError);
              // Clear invalid session
              await clearSession();
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const clearSession = async (): Promise<void> => {
    try {
      if (useIndexedDB) {
        await clearAllData();
      } else {
        clearAllDataFallback();
      }
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
    
    apiService.clearToken();
    setUser(null);
  };

  const saveSession = async (userResponse: UserResponse): Promise<void> => {
    try {
      const sessionData = {
        user: userResponse.user,
        token: userResponse.token
      };

      if (useIndexedDB) {
        await setUserData(sessionData);
      } else {
        setUserDataFallback(sessionData);
      }
      
      apiService.setToken(userResponse.token.access_token);
      setUser(userResponse.user);
    } catch (error) {
      console.error('Failed to save session:', error);
      // Try fallback
      if (useIndexedDB) {
        setUserDataFallback({
          user: userResponse.user,
          token: userResponse.token
        });
      }
    }
  };

  const loginAsGuest = async (name?: string): Promise<void> => {
    setIsLoading(true);
    try {
      const userResponse = await apiService.loginAsGuest({
        name: 'אורח',
        type: 'guest'
      });
      
      await saveSession(userResponse);
    } catch (error) {
      console.error('Guest login failed:', error);
      throw new Error('כניסה כאורח נכשלה. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Get Google auth URL from backend
      const { auth_url } = await apiService.getGoogleAuthUrl();
      
      // Open Google auth in popup
      const popup = window.open(
        auth_url,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for popup messages
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setIsLoading(false);
            reject(new Error('Google login was cancelled'));
          }
        }, 1000);

        const messageListener = async (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === 'GOOGLE_AUTH_SUCCESS' && event.data.code) {
            clearInterval(checkClosed);
            popup.close();
            window.removeEventListener('message', messageListener);

            try {
              const userResponse = await apiService.handleGoogleCallback(event.data.code);
              await saveSession(userResponse);
              resolve();
            } catch (error) {
              console.error('Google callback failed:', error);
              reject(new Error('כניסה עם Google נכשלה. אנא נסה שוב.'));
            } finally {
              setIsLoading(false);
            }
          }

          if (event.data.type === 'GOOGLE_AUTH_ERROR') {
            clearInterval(checkClosed);
            popup.close();
            window.removeEventListener('message', messageListener);
            setIsLoading(false);
            reject(new Error(event.data.error || 'כניסה עם Google נכשלה.'));
          }
        };

        window.addEventListener('message', messageListener);
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiService.logout();
      await clearSession();
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear session anyway
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      await apiService.refreshToken();
      // Token is automatically updated in the API service
    } catch (error) {
      console.error('Token refresh failed:', error);
      await clearSession();
      throw error;
    }
  };

  const clearAllAppData = async (): Promise<void> => {
    try {
      if (useIndexedDB) {
        await clearAllData();
      } else {
        clearAllDataFallback();
      }
    } catch (error) {
      console.error('Failed to clear all app data:', error);
      // Try fallback if primary method fails
      if (useIndexedDB) {
        clearAllDataFallback();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginAsGuest,
        loginWithGoogle,
        logout,
        refreshToken,
        clearAllAppData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};