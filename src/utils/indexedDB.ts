// IndexedDB utility for persistent storage with support for complex data and images

const DB_NAME = 'CheckoutApp';
const DB_VERSION = 1;
const STORE_NAME = 'appData';

interface StorageData {
  key: 'user' | 'list';
  value: any;
  timestamp: number;
}

class IndexedDBStorage {
  private db: IDBDatabase | null = null;

  // Initialize the database
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Ensure database is initialized
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  // Set data with a specific key
  async setItem(key: 'user' | 'list', value: any): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const data: StorageData = {
        key,
        value,
        timestamp: Date.now()
      };

      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to store ${key}`));
    });
  }

  // Get data by key
  async getItem(key: 'user' | 'list'): Promise<any> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };

      request.onerror = () => reject(new Error(`Failed to get ${key}`));
    });
  }

  // Remove data by key
  async removeItem(key: 'user' | 'list'): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to remove ${key}`));
    });
  }

  // Clear all data
  async clear(): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear database'));
    });
  }

  // Get all keys
  async getAllKeys(): Promise<string[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(new Error('Failed to get keys'));
    });
  }

  // Check if database is supported
  static isSupported(): boolean {
    return 'indexedDB' in window;
  }
}

// Create singleton instance
const dbStorage = new IndexedDBStorage();

// Initialize on first import
let initPromise: Promise<void> | null = null;

const ensureInit = async (): Promise<void> => {
  if (!initPromise) {
    initPromise = dbStorage.init();
  }
  await initPromise;
};

// Export convenient functions
export const setUserData = async (userData: any): Promise<void> => {
  await ensureInit();
  return dbStorage.setItem('user', userData);
};

export const getUserData = async (): Promise<any> => {
  await ensureInit();
  return dbStorage.getItem('user');
};

export const setListData = async (listData: any): Promise<void> => {
  await ensureInit();
  return dbStorage.setItem('list', listData);
};

export const getListData = async (): Promise<any> => {
  await ensureInit();
  return dbStorage.getItem('list');
};

export const removeUserData = async (): Promise<void> => {
  await ensureInit();
  return dbStorage.removeItem('user');
};

export const removeListData = async (): Promise<void> => {
  await ensureInit();
  return dbStorage.removeItem('list');
};

export const clearAllData = async (): Promise<void> => {
  await ensureInit();
  return dbStorage.clear();
};

export const isStorageSupported = (): boolean => {
  return IndexedDBStorage.isSupported();
};

// Fallback to localStorage if IndexedDB is not supported
const fallbackStorage = {
  setItem: (key: string, value: any) => {
    try {
      localStorage.setItem(`checkout_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  getItem: (key: string) => {
    try {
      const item = localStorage.getItem(`checkout_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  },
  
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(`checkout_${key}`);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('checkout_'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};

// Export fallback functions
export const setUserDataFallback = (userData: any): void => {
  fallbackStorage.setItem('user', userData);
};

export const getUserDataFallback = (): any => {
  return fallbackStorage.getItem('user');
};

export const setListDataFallback = (listData: any): void => {
  fallbackStorage.setItem('list', listData);
};

export const getListDataFallback = (): any => {
  return fallbackStorage.getItem('list');
};

export const clearAllDataFallback = (): void => {
  fallbackStorage.clear();
};

export default dbStorage;