import api from './axios';

export interface Stock {
  _id: string;
  productId: string;
  storeId: string;
  quantity: number;
}

export const getStocks = async (threshold?: string): Promise<Stock[]> => {
  const res = await api.get('/stock', {
    params: threshold && threshold.trim() !== '' ? { threshold } : {}
  });
  return res.data?.data
};

export const adjustStock = async (adjustment: { storeId: string; productId: string; amount: number }) => {  
  const res = await api.post('/stock/adjust', adjustment);
  return res.data?.data
};

export const transferStock = async (transfer: { productId: string; sourceStoreId: string; destStoreId: string; quantity: number }) => {
  const res = await api.post('/stock/transfer', transfer);
  return res.data?.data
};
