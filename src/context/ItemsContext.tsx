import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Item, Price } from '../types';
import { 
  getListData, 
  setListData, 
  isStorageSupported,
  getListDataFallback,
  setListDataFallback
} from '../utils/indexedDB';



export interface CartItem {
  item: Item;
  quantity: number;
}

interface ItemsContextType {
  items: Item[];
  cartItems: CartItem[];
  addItem: (name: string, prices: Price[], currentPrice: number) => void;
  updateItem: (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteItem: (id: string) => void;
  reorderItems: (startIndex: number, endIndex: number) => void;
  addToCart: (itemId: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getCartItemsCount: () => number;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const useItems = (): ItemsContextType => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};

interface ItemsProviderProps {
  children: ReactNode;
}

export const ItemsProvider: React.FC<ItemsProviderProps> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [useIndexedDB, setUseIndexedDB] = useState(false);

  // Load items and cart from IndexedDB/localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if IndexedDB is supported
        const indexedDBSupported = isStorageSupported();
        setUseIndexedDB(indexedDBSupported);

        let savedData: { items: Item[], cartItems: CartItem[] } | null = null;

        if (indexedDBSupported) {
          try {
            savedData = await getListData();
          } catch (error) {
            console.warn('IndexedDB failed, falling back to localStorage:', error);
            savedData = getListDataFallback();
            setUseIndexedDB(false);
          }
        } else {
          savedData = getListDataFallback();
        }

        if (savedData) {
          // Load items
          if (savedData.items && Array.isArray(savedData.items)) {
            const itemsWithDates = savedData.items.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt)
            }));
            setItems(itemsWithDates);
          }

          // Load cart
          if (savedData.cartItems && Array.isArray(savedData.cartItems)) {
            const cartWithDates = savedData.cartItems.map((cartItem: any) => ({
              ...cartItem,
              item: {
                ...cartItem.item,
                createdAt: new Date(cartItem.item.createdAt),
                updatedAt: new Date(cartItem.item.updatedAt)
              }
            }));
            setCartItems(cartWithDates);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Save data whenever items or cart change
  useEffect(() => {
    const saveData = async () => {
      const listData = {
        items,
        cartItems
      };

      try {
        if (useIndexedDB) {
          await setListData(listData);
        } else {
          setListDataFallback(listData);
        }
      } catch (error) {
        console.error('Failed to save list data:', error);
        // Try fallback
        if (useIndexedDB) {
          setListDataFallback(listData);
        }
      }
    };

    // Only save if we have some data (avoid saving on initial empty state)
    if (items.length > 0 || cartItems.length > 0) {
      saveData();
    }
  }, [items, cartItems, useIndexedDB]);

  const addItem = (name: string, prices: Price[], currentPrice: number) => {
    const newItem: Item = {
      name,
      prices,
      currentPrice,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, updatedAt: new Date() }
        : item
    ));

    // Update item in cart if it exists there
    setCartItems(prev => prev.map(cartItem => 
      cartItem.item.id === id 
        ? { 
            ...cartItem, 
            item: { ...cartItem.item, ...updates, updatedAt: new Date() }
          }
        : cartItem
    ));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    // Also remove from cart if it exists there
    setCartItems(prev => prev.filter(cartItem => cartItem.item.id !== id));
  };

  const reorderItems = (startIndex: number, endIndex: number) => {
    setItems(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const addToCart = (itemId: string, quantity: number = 1) => {
    const item = items.find(item => item.id === itemId);
    if (!item) return;

    setCartItems(prev => {
      const existingCartItem = prev.find(cartItem => cartItem.item.id === itemId);
      
      if (existingCartItem) {
        // Update quantity if item already in cart
        return prev.map(cartItem =>
          cartItem.item.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // Add new item to cart
        return [...prev, { item, quantity }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(cartItem => cartItem.item.id !== itemId));
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prev => prev.map(cartItem =>
      cartItem.item.id === itemId
        ? { ...cartItem, quantity }
        : cartItem
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = (): number => {
    return cartItems.reduce((total, cartItem) => {
      return total + (cartItem.item.currentPrice * cartItem.quantity);
    }, 0);
  };

  const getCartItemsCount = (): number => {
    return cartItems.reduce((total, cartItem) => total + cartItem.quantity, 0);
  };

  return (
    <ItemsContext.Provider
      value={{
        items,
        cartItems,
        addItem,
        updateItem,
        deleteItem,
        reorderItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getTotalPrice,
        getCartItemsCount,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};