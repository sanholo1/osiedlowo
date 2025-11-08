import React from 'react';
import type { LoginForm, RegisterForm } from '../types/auth.types';

interface RegisterFormProps {
    onSubmit: (data: RegisterForm) => void;
    formData: RegisterForm;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RegisterFormComponent: React.FC<RegisterFormProps> = ({ onSubmit, formData, onChange }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    required
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Hasło:</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={onChange}
                    required
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Imię:</label>
                <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={onChange}
                    required
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Nazwisko:</label>
                <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={onChange}
                    required
                    className="form-input"
                />
            </div>

            <button type="submit" className="button button-success">
                Zarejestruj się
            </button>
        </form>
    );
};
