import React, { createContext, useContext, useState } from 'react';
import { LoginForm, RegisterForm, User } from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthContextType {
    user: User | null;
    token: string | null;
    message: string;
    isLoading: boolean;
    isLoggedIn: boolean;
    login: (data: LoginForm) => Promise<boolean>;
    register: (data: RegisterForm) => Promise<boolean>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const login = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            const response = await authService.login(data);
            const { token, user } = response.data;
            setToken(token);
            setUser(user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setMessage('auth_login_success');
            return true;
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'auth_login_error_general');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterForm) => {
        setIsLoading(true);
        try {
            await authService.register(data);
            setMessage('auth_register_success');
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.errors
                ? error.response.data.errors.join(', ')
                : error.response?.data?.message || 'auth_register_error_general';
            setMessage(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setMessage('auth_logout_success');
    };

    const updateUser = (userData: Partial<User>) => {
        const updatedUser = { ...user, ...userData } as User;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        token,
        message,
        isLoading,
        isLoggedIn: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
