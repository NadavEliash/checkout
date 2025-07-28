import React, { useState } from 'react';
import { Price } from '../types';

interface ItemFormProps {
  onAddItem: (name: string, prices: Price[]) => void;
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

interface PriceInput {
  amount: string;
  label: string;
}

const ItemForm: React.FC<ItemFormProps> = ({ onAddItem }) => {
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [priceInputs, setPriceInputs] = useState<PriceInput[]>([
    { amount: '', label: '' }
  ]);
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [items, setItems] = useState<{
    id: string;
    name: string;
    description?: string;
    prices: Price[];
    image: string;
  }[]>([]);

  const addPriceInput = (): void => {
    setPriceInputs(prev => [...prev, { amount: '', label: '' }]);
  };

  const removePriceInput = (index: number): void => {
    if (priceInputs.length > 1) {
      setPriceInputs(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updatePriceInput = (index: number, field: keyof PriceInput, value: string): void => {
    setPriceInputs(prev => 
      prev.map((price, i) => 
        i === index ? { ...price, [field]: value } : price
      )
    );
  };

  const collectPrices = (): Price[] => {
    return priceInputs
      .filter(input => input.amount && parseFloat(input.amount) > 0)
      .map((input) => ({
        amount: parseFloat(input.amount),
        label: input.label.trim() || ''
      }));
  };

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
    
    const prices = collectPrices();
    if (prices.length === 0) {
      setPriceError('נדרש לפחות מחיר אחד');
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
      prices: prices,
      image: '' // Empty for now
    };
    setItems(prev => [...prev, newItem]);
    
    onAddItem(itemName, prices);
    
    // Reset form
    setItemName('');
    setItemDescription('');
    setPriceInputs([{ amount: '', label: '' }]);
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
          <label className="font-semibold mb-2 text-gray-600">מחירים:</label>
          <div>
            {priceInputs.map((priceInput, index) => (
              <div key={index} className="flex gap-3 mb-3 items-center flex-col lg:flex-row">
                <input
                  type="number"
                  placeholder="מחיר"
                  step="0.01"
                  min="0"
                  value={priceInput.amount}
                  onChange={(e) => {
                    updatePriceInput(index, 'amount', e.target.value);
                    if (priceError) setPriceError('');
                  }}
                  className="flex-1 p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <input
                  type="text"
                  placeholder="תיאור (אופציונלי)"
                  value={priceInput.label}
                  onChange={(e) => updatePriceInput(index, 'label', e.target.value)}
                  className="flex-1 p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => removePriceInput(index)}
                  disabled={priceInputs.length === 1}
                >
                  <img src="/assets/delete.svg" alt="מחק" width={24}/>
                </button>
              </div>
            ))}
          </div>
          <div className="h-6 mb-3">
            {priceError && <span className="text-red-500 text-sm">{priceError}</span>}
          </div>
          <button 
            type="button" 
            onClick={addPriceInput}
            className="bg-green-500 text-white border-none py-2 px-5 rounded-lg cursor-pointer text-sm transition-colors hover:bg-green-600"
          >
            הוסף מחיר נוסף
          </button>
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