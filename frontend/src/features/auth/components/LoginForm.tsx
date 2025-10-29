import React from 'react';
import type { LoginForm as LoginFormType } from '../types/auth.types';

interface LoginFormProps {
    onSubmit: (data: LoginFormType) => void;
    formData: LoginFormType;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LoginFormComponent: React.FC<LoginFormProps> = ({ onSubmit, formData, onChange }) => {
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

            <button type="submit" className="button button-success">
                Zaloguj się
            </button>
        </form>
    );
};