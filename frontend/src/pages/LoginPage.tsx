import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { LoginForm } from '../types/auth.types';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, message, isLoading } = useAuth();
    const [formData, setFormData] = useState<LoginForm>({
        email: '',
        password: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(formData);
        if (success) {
            navigate('/home');
        }
    };

    return (
        <div>
            <h1>Osiedlowo</h1>
            <h2>Logowanie</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label>Hasło</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                    />
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                </button>
            </form>

            {message && <div>{message}</div>}

            <p>
                Nie masz konta? <Link to="/register">Zarejestruj się</Link>
            </p>
        </div>
    );
};
