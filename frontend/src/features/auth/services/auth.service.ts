import { axiosInstance } from '../../../core/api/axios.instance';
import { API_ENDPOINTS } from '../../../core/config/api.config';
import { LoginForm, RegisterForm, AuthResponse } from '../types/auth.types';

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