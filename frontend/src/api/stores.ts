import api from './axios';

export interface StoreType {
  _id: string;
  name: string;
  location: string;
}

export const getStores = async (): Promise<StoreType[]> => {
  const res = await api.get('/store');
  return res.data?.data
};

export const createStore = async (newStore: { name: string; location: string }): Promise<StoreType> => {
  const res = await api.post('/store', newStore);
  return res.data?.data
};

export const updateStore = async (id: string, updatedStore: Partial<StoreType>): Promise<StoreType> => {
  const res = await api.put(`/store/${id}`, updatedStore);
  return res.data?.data;
};

export const deleteStore = async (id: string): Promise<any> => {
  const res = await api.delete(`/store/${id}`);
  return res.data;
};
