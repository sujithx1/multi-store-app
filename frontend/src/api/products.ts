import api from './axios';

export interface Product {
  _id: string;
  name: string;
  sku: string;
}

export const getProducts = async (): Promise<Product[]> => {
  const res = await api.get('/product');
  return res.data;
};

export const createProduct = async (newProduct: { name: string; sku: string }): Promise<Product> => {
  const res = await api.post('/product', newProduct);
  return res.data;
};
