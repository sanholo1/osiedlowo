import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { RegisterForm } from '../types/auth.types';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, message, isLoading } = useAuth();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await register(formData);
        if (success) {
            navigate('/login');
        }
    };

    return (
        <div>
            <h1>Osiedlowo</h1>
            <h2>Rejestracja</h2>

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

                <div>
                    <label>Imię</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label>Nazwisko</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                    />
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
                </button>
            </form>

            {message && <div>{message}</div>}

            <p>
                Masz już konto? <Link to="/login">Zaloguj się</Link>
            </p>
        </div>
    );
};
