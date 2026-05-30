import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ApiResponse,
  AuthResponseDTO,
  GenerateUIRequestDTO,
  GenerateUIResponseDTO,
  HistoryListResponseDTO,
  LoginDTO,
  RegisterDTO,
} from '@aiuix/shared';

const http: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (res: AxiosResponse<ApiResponse<unknown>>) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    register: (data: RegisterDTO) =>
      http.post<ApiResponse<AuthResponseDTO>>('/auth/register', data),

    login: (data: LoginDTO) =>
      http.post<ApiResponse<AuthResponseDTO>>('/auth/login', data),

    logout: () =>
      http.post<ApiResponse<null>>('/auth/logout'),

    getMe: () =>
      http.get('/auth/me'),
  },

  generate: {
    ui: (data: GenerateUIRequestDTO) =>
      http.post<ApiResponse<GenerateUIResponseDTO>>('/generate/ui', data),
  },

  history: {
    list: (page = 1, limit = 10, favorites = false) =>
      http.get<ApiResponse<HistoryListResponseDTO>>('/history', {
        params: {
          page,
          limit,
          ...(favorites && { favorites: 'true' }),
        },
      }),

    delete: (id: string) =>
      http.delete<ApiResponse<null>>(`/history/${id}`),

    toggleFavorite: (id: string) =>
      http.patch<ApiResponse<null>>(`/history/${id}/favorite`),
  },
};