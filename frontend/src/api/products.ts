import api from './axios';

export interface Product {
  _id: string;
  name: string;
  sku: string;
}

export const getProducts = async (params?: { page?: number; limit?: number; search?: string }): Promise<Product[]> => {
  const res = await api.get('/product', { params });
  return res.data?.data
};

export const createProduct = async (newProduct: { name: string; sku: string }): Promise<Product> => {
  const res = await api.post('/product', newProduct);
  return res.data?.data
};

export const updateProduct = async (id: string, updatedProduct: Partial<Product>): Promise<Product> => {
  const res = await api.put(`/product/${id}`, updatedProduct);
  return res.data?.data;
};

export const deleteProduct = async (id: string): Promise<any> => {
  const res = await api.delete(`/product/${id}`);
  return res.data;
};
