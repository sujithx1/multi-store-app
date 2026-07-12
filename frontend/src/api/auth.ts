import api from './axios';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email:string;
  password: string;
}

export const login = async (params: LoginParams) => {
  const res = await api.post('/auth/login', params);
  console.log(res.data);
  return res.data?.data;
};

export const register = async (params: RegisterParams) => {
  const res = await api.post('/auth/register', params);
  return res.data;
};
