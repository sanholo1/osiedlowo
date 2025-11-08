import React, { useState } from 'react';
import type { LoginForm, RegisterForm } from '../types/auth.types';
import { LoginFormComponent } from './LoginForm';
import { RegisterFormComponent } from './RegisterForm';
import { useAuth } from '../contexts/AuthContext';

export const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { login, register, message, isLoading } = useAuth();
    const [formData, setFormData] = useState<RegisterForm>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (data: LoginForm | RegisterForm) => {
        if (isLogin) {
            await login(data as LoginForm);
        } else {
            const success = await register(data as RegisterForm);
            if (success) {
                setIsLogin(true);
            }
        }
    };

    return (
        <div className="container">
            <h1>🏘️ Osiedlowo</h1>

            <div className="button-group">
                <button
                    onClick={() => setIsLogin(true)}
                    className={`button ${isLogin ? 'button-primary' : 'button-secondary'}`}
                    disabled={isLoading}
                >
                    Logowanie
                </button>
                <button
                    onClick={() => setIsLogin(false)}
                    className={`button ${!isLogin ? 'button-primary' : 'button-secondary'}`}
                    disabled={isLoading}
                >
                    Rejestracja
                </button>
            </div>

            {isLogin ? (
                <LoginFormComponent
                    onSubmit={handleSubmit}
                    formData={formData}
                    onChange={handleInputChange}
                />
            ) : (
                <RegisterFormComponent
                    onSubmit={handleSubmit}
                    formData={formData}
                    onChange={handleInputChange}
                />
            )}

            {message && (
                <div
                    className={`message ${
                        message.includes('Błąd') ? 'message-error' : 'message-success'
                    }`}
                >
                    {message}
                </div>
            )}
        </div>
    );
};
