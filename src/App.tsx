import React, { useState } from 'react';
import { Item, Price } from './types';
import ItemForm from './components/ItemForm';
import ItemsList from './components/ItemsList';

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [nextId, setNextId] = useState(1);

  const generateUniqueId = (): string => {
    const id = `ITEM_${nextId}_${Date.now()}`;
    setNextId(prev => prev + 1);
    return id;
  };

  const addItem = (name: string, prices: Price[]): void => {
    const newItem: Item = {
      id: generateUniqueId(),
      name: name.trim(),
      prices,
      createdAt: new Date()
    };
    
    setItems(prev => [...prev, newItem]);
  };

  const deleteItem = (itemId: string): void => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const reorderItems = (startIndex: number, endIndex: number): void => {
    setItems(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-gray-800 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto p-5">
        <header className="text-center bg-white/95 p-10 rounded-2xl mb-8 shadow-xl flex justify-center gap-10">
          <div className="flex flex-col">
            <h1 className="text-5xl text-gray-700 mb-3 font-bold">צ'קאאוט</h1>
            <p className="text-xl text-gray-600 font-light">פשוט למכור</p>
          </div>
          <img className="w-16" src="/assets/checkout.svg" alt="עגלת קניות" />
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ItemForm onAddItem={addItem} />
          <ItemsList items={items} onDeleteItem={deleteItem} onReorderItems={reorderItems} />
        </main>
      </div>
    </div>
  );
};

export default App;