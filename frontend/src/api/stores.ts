import api from './axios';

export interface StoreType {
  _id: string;
  name: string;
}

export const getStores = async (): Promise<StoreType[]> => {
  const res = await api.get('/store');
  return res.data;
};

export const createStore = async (newStore: { name: string }): Promise<StoreType> => {
  const res = await api.post('/store', newStore);
  return res.data;
};
