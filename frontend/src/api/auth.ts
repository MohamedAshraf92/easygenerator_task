import api from './axios';

export interface AuthResponse {
  accessToken: string;
}

export const signUp = (email: string, name: string, password: string) =>
  api.post<AuthResponse>('/auth/signup', { email, name, password });

export const signIn = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/signin', { email, password });

export const getMe = () => api.get<{ id: string; email: string }>('/auth/me');
