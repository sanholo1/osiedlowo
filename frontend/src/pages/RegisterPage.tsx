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
        <div id='container-log-reg'>
            <h1>Osiedlowo<svg viewBox="0 0 1024 1024" width="32px" height="32px" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M896 832H128V490.666667L512 128l384 362.666667z" fill="#E8EAF6"></path><path d="M832 448l-106.666667-106.666667V192h106.666667zM128 832h768v106.666667H128z" fill="#C5CAE9"></path><path d="M512 91.733333L85.333333 488.533333l42.666667 46.933334L512 179.2l384 356.266667 42.666667-46.933334z" fill="#B71C1C"></path><path d="M384 597.333333h256v341.333334H384z" fill="#D84315"></path><path d="M448 362.666667h128v128h-128z" fill="#01579B"></path><path d="M586.666667 757.333333c-6.4 0-10.666667 4.266667-10.666667 10.666667v42.666667c0 6.4 4.266667 10.666667 10.666667 10.666666s10.666667-4.266667 10.666666-10.666666v-42.666667c0-6.4-4.266667-10.666667-10.666666-10.666667z" fill="#FF8A65"></path></g></svg></h1>
            <h2>Rejestracja</h2>

            <form onSubmit={handleSubmit}>
                <div id="in-form">
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
