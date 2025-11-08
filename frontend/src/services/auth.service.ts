import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api.config';
import { LoginForm, RegisterForm, AuthResponse } from '../types/auth.types';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: async (data: LoginForm) => {
        const response = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
        return response.data;
    },

    register: async (data: RegisterForm) => {
        const response = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    }
};
