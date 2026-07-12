import api from './axios';

export interface Stock {
  _id: string;
  productId: string | { _id: string; name?: string; sku?: string; unit?: string };
  storeId: string | { _id: string; name?: string; location?: string };
  quantity: number;
}

export const getStocks = async (threshold?: string): Promise<Stock[]> => {
  const res = await api.get('/stock', {
    params: threshold && threshold.trim() !== '' ? { threshold } : {}
  });
  return res.data?.data;
};

export const adjustStock = async (payload: { stockId: string; quantity: number; type: 'inc' | 'dec' }) => {  
  const res = await api.post(`/stock/adjust/${payload.stockId}`, {
    quantity: payload.quantity,
    type: payload.type
  });
  return res.data?.data;
};

export const transferStock = async (transfer: { productId: string; sourceStoreId: string; destStoreId: string; quantity: number }) => {
  const res = await api.post('/stock/transfer', {
    productId: transfer.productId,
    senderStoreId: transfer.sourceStoreId,
    receiverStoreId: transfer.destStoreId,
    quantity: transfer.quantity,
  });
  return res.data?.data;
};

export const addStock = async (payload: { productId: string; storeId: string; quantity: number }) => {
  const res = await api.post('/stock/add', payload);
  return res.data?.data;
};

export const updateStock = async (payload: { productId: string; storeId: string; quantity: number }) => {
  const res = await api.post('/stock/update', payload);
  return res.data?.data;
};
