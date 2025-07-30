import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  getUserData, 
  setUserData, 
  removeUserData, 
  clearAllData,
  isStorageSupported,
  getUserDataFallback,
  setUserDataFallback,
  clearAllDataFallback
} from '../utils/indexedDB';

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  type: 'guest';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsGuest: (name?: string) => void;
  logout: () => void;
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

        let savedUser: User | null = null;

        if (indexedDBSupported) {
          try {
            savedUser = await getUserData();
          } catch (error) {
            console.warn('IndexedDB failed, falling back to localStorage:', error);
            savedUser = getUserDataFallback();
            setUseIndexedDB(false);
          }
        } else {
          savedUser = getUserDataFallback();
        }

        if (savedUser && savedUser.id && savedUser.name && savedUser.type === 'guest') {
          setUser(savedUser);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginAsGuest = async (name?: string): Promise<void> => {
    const guestName = name?.trim() || 'אורח';
    const guestUser: User = {
      id: 'guest_' + Date.now(),
      name: guestName,
      type: 'guest'
    };
    
    setUser(guestUser);
    
    try {
      if (useIndexedDB) {
        await setUserData(guestUser);
      } else {
        setUserDataFallback(guestUser);
      }
    } catch (error) {
      console.error('Failed to save user data:', error);
      // Try fallback
      if (useIndexedDB) {
        setUserDataFallback(guestUser);
      }
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    
    try {
      if (useIndexedDB) {
        await clearAllData();
      } else {
        clearAllDataFallback();
      }
    } catch (error) {
      console.error('Failed to clear data:', error);
      // Try fallback
      clearAllDataFallback();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};