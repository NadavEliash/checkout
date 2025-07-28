export interface Price {
  amount: number;
  label: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  prices: Price[];
  createdAt: Date;
}