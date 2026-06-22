import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface AuthResponse {
  accessToken: string;
}

export const signUp = (email: string, name: string, password: string) =>
  api.post<AuthResponse>('/auth/signup', { email, name, password });

export const signIn = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/signin', { email, password });

export const getMe = () => api.get<{ id: string; email: string }>('/auth/me');
