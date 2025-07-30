import React, { useState } from 'react';
import { Price } from '../types';
import PriceSelector from './PriceSelector';

interface ItemFormProps {
  onAddItem: (name: string, prices: Price[], currentPrice: number) => void;
}

interface CheckoutPage {
  id: string;
  items: {
    id: string;
    name: string;
    description?: string;
    prices: Price[];
    image: string;
  }[];
  userDetails: Record<string, any>;
}


const ItemForm: React.FC<ItemFormProps> = ({ onAddItem }) => {
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [prices, setPrices] = useState<Price[]>([{ amount: 0, label: 'מחיר רגיל' }]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [items, setItems] = useState<{
    id: string;
    name: string;
    description?: string;
    prices: Price[];
    image: string;
  }[]>([]);


  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    // Reset errors
    setNameError('');
    setPriceError('');
    
    let hasErrors = false;
    
    if (!itemName.trim()) {
      setNameError('שדה זה חובה');
      hasErrors = true;
    }
    
    const validPrices = prices.filter(p => p.amount > 0);
    if (validPrices.length === 0) {
      setPriceError('נדרש לפחות מחיר אחד');
      hasErrors = true;
    }
    
    if (currentPrice <= 0) {
      setPriceError('יש לבחור מחיר נוכחי תקין');
      hasErrors = true;
    }
    
    if (hasErrors) {
      return;
    }
    
    // Add to local items list
    const newItem = {
      id: Date.now().toString(),
      name: itemName,
      description: itemDescription.trim() || undefined,
      prices: validPrices,
      image: '' // Empty for now
    };
    setItems(prev => [...prev, newItem]);
    
    onAddItem(itemName, validPrices, currentPrice);
    
    // Reset form
    setItemName('');
    setItemDescription('');
    setPrices([{ amount: 0, label: 'מחיר רגיל' }]);
    setCurrentPrice(0);
  };

  const generateCheckoutPage = (): void => {
    const checkoutPage: CheckoutPage = {
      id: Date.now().toString(),
      items: items,
      userDetails: {}
    };
    console.log('Checkout Page:', checkoutPage);
  };

  return (
    <section className="bg-white/95 p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl text-gray-700 mb-5 text-center font-semibold">הוסף מוצר חדש</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col">
          <label htmlFor="item-name" className="font-semibold mb-2 text-gray-600">שם המוצר:</label>
          <input
            type="text"
            id="item-name"
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
              if (nameError) setNameError('');
            }}
            className={`p-3 border-2 rounded-lg text-base transition-colors focus:outline-none ${
              nameError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'
            }`}
          />
          <div className="h-6 mt-1">
            {nameError && <span className="text-red-500 text-sm">{nameError}</span>}
          </div>
        </div>

        <div className="flex flex-col">
          <label htmlFor="item-description" className="font-semibold mb-2 text-gray-600">תיאור המוצר (אופציונלי):</label>
          <textarea
            id="item-description"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            rows={3}
            className="p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500 resize-vertical"
            placeholder="הוסף תיאור למוצר..."
          />
        </div>

        <div className="flex flex-col">
          <PriceSelector
            prices={prices}
            currentPrice={currentPrice}
            onPricesChange={(newPrices, newCurrentPrice) => {
              setPrices(newPrices);
              setCurrentPrice(newCurrentPrice);
              if (priceError) setPriceError('');
            }}
          />
          <div className="h-6 mt-1">
            {priceError && <span className="text-red-500 text-sm">{priceError}</span>}
          </div>
        </div>

        <button 
          type="submit"
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none p-4 rounded-lg text-lg font-semibold cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-lg"
        >
          הוסף מוצר
        </button>
      </form>
      
      {items.length > 0 && (
        <button 
          type="button"
          onClick={generateCheckoutPage}
          className="w-full mt-4 bg-gradient-to-r from-green-500 to-blue-600 text-white border-none p-4 rounded-lg text-lg font-semibold cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-lg"
        >
          צור עמוד תשלום ({items.length} מוצרים)
        </button>
      )}
    </section>
  );
};

export default ItemForm;