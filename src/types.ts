export interface Price {
  amount: number;
  label: string;
}

export interface Item {
  id: string;
  name: string;
  prices: Price[];
  currentPrice: number; // Optional, can be derived from prices
  description?: string;
  category?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}