import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Item, Price } from '../types';
import { 
  getListData, 
  setListData, 
  isStorageSupported,
  getListDataFallback,
  setListDataFallback
} from '../utils/indexedDB';
import apiService from '../services/api';
import { useAuth } from './AuthContext';



export interface CartItem {
  item: Item;
  quantity: number;
}

interface ItemsContextType {
  items: Item[];
  cartItems: CartItem[];
  addItem: (name: string, prices: Price[], currentPrice: number, description?: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  reorderItems: (startIndex: number, endIndex: number) => Promise<void>;
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
  const { isAuthenticated, user } = useAuth();

  // Load items and cart based on authentication status
  useEffect(() => {
    const loadData = async () => {
      try {
        if (isAuthenticated && user?.type === 'google') {
          // Load items from Redis via API for authenticated Google users
          try {
            const apiItems = await apiService.getItems();
            const itemsWithDates = apiItems.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt)
            }));
            setItems(itemsWithDates);
            // For authenticated users, start with empty cart (cart is session-based)
            setCartItems([]);
          } catch (error) {
            console.error('Failed to load items from API:', error);
            // Fallback to empty state for authenticated users
            setItems([]);
            setCartItems([]);
          }
        } else {
          // Load from IndexedDB/localStorage for guest users
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
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [isAuthenticated, user]);

  // Save data for guest users only (authenticated users use API)
  useEffect(() => {
    const saveData = async () => {
      // Only save locally for guest users
      if (!isAuthenticated || user?.type !== 'google') {
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
      }
    };

    saveData();
  }, [items, cartItems, useIndexedDB, isAuthenticated, user]);

  const addItem = async (name: string, prices: Price[], currentPrice: number, description?: string) => {
    try {
      if (isAuthenticated && user?.type === 'google') {
        // Create item via API for authenticated users
        const newItem = await apiService.createItem({
          name,
          prices,
          currentPrice,
          description
        });
        const itemWithDates = {
          ...newItem,
          createdAt: new Date(newItem.createdAt),
          updatedAt: new Date(newItem.updatedAt)
        };
        setItems(prev => [...prev, itemWithDates]);
      } else {
        // Create item locally for guest users
        const newItem: Item = {
          name,
          prices,
          currentPrice,
          description,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setItems(prev => [...prev, newItem]);
      }
    } catch (error) {
      console.error('Failed to add item:', error);
      throw new Error('Failed to add item');
    }
  };

  const updateItem = async (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      if (isAuthenticated && user?.type === 'google') {
        // Update item via API for authenticated users
        const updatedItem = await apiService.updateItem(id, updates);
        const itemWithDates = {
          ...updatedItem,
          createdAt: new Date(updatedItem.createdAt),
          updatedAt: new Date(updatedItem.updatedAt)
        };
        setItems(prev => prev.map(item => 
          item.id === id ? itemWithDates : item
        ));
        
        // Update item in cart if it exists there
        setCartItems(prev => prev.map(cartItem => 
          cartItem.item.id === id 
            ? { ...cartItem, item: itemWithDates }
            : cartItem
        ));
      } else {
        // Update item locally for guest users
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
      }
    } catch (error) {
      console.error('Failed to update item:', error);
      throw new Error('Failed to update item');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      if (isAuthenticated && user?.type === 'google') {
        // Delete item via API for authenticated users
        await apiService.deleteItem(id);
        setItems(prev => prev.filter(item => item.id !== id));
        setCartItems(prev => prev.filter(cartItem => cartItem.item.id !== id));
      } else {
        // Delete item locally for guest users
        setItems(prev => prev.filter(item => item.id !== id));
        setCartItems(prev => prev.filter(cartItem => cartItem.item.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw new Error('Failed to delete item');
    }
  };

  const reorderItems = async (startIndex: number, endIndex: number) => {
    try {
      const newItems = Array.from(items);
      const [removed] = newItems.splice(startIndex, 1);
      newItems.splice(endIndex, 0, removed);
      
      if (isAuthenticated && user?.type === 'google') {
        // Update order via API for authenticated users
        const itemsWithOrder = newItems.map((item, index) => ({
          id: item.id,
          order: index
        }));
        await apiService.reorderItems(itemsWithOrder);
        setItems(newItems);
      } else {
        // Update order locally for guest users
        setItems(newItems);
      }
    } catch (error) {
      console.error('Failed to reorder items:', error);
      throw new Error('Failed to reorder items');
    }
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