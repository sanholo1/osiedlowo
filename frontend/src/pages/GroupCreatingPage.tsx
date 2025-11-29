import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/GroupCreatingPage.css';

export const GroupCreatingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        status: 'priv',
        password: ''
    });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isRedirecting, setIsRedirecting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        if (!formData.name.trim() || !formData.city.trim()) {
            setMessage('Nazwa osiedla i miasto są wymagane');
            setIsLoading(false);
            return;
        }

        if (formData.status === 'priv' && !formData.password.trim()) {
            setMessage('Hasło jest wymagane dla prywatnych osiedli');
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/neighborhoods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    city: formData.city,
                    isPrivate: formData.status === 'priv',
                    password: formData.status === 'priv' ? formData.password : undefined
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Osiedle zostało utworzone pomyślnie!');
                setIsRedirecting(true);
                setTimeout(() => {
                    navigate('/groupslist');
                }, 2000);
            } else {
                setMessage(data.message || 'Wystąpił błąd podczas tworzenia osiedla');
            }
        } catch (error) {
            setMessage('Błąd połączenia z serwerem');
            console.error('Error creating neighborhood:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div id="neighbourhood-creating-container">
            <h2>Stwórz swoje osiedle</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nazwa osiedla: </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isLoading || isRedirecting}
                        required
                    />
                </div>
                <div>
                    <label>Miasto: </label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={isLoading || isRedirecting}
                        required
                    />
                </div>
                <div>
                    <h3>Status osiedla:</h3>
                    <label>Publiczne</label>
                    <input
                        type="radio"
                        name="status"
                        id="neigh-pub"
                        value="pub"
                        checked={formData.status === 'pub'}
                        onChange={handleInputChange}
                        disabled={isLoading || isRedirecting}
                    />
                    <label>Prywatne</label>
                    <input
                        type="radio"
                        name="status"
                        id="neigh-priv"
                        value="priv"
                        checked={formData.status === 'priv'}
                        onChange={handleInputChange}
                        disabled={isLoading || isRedirecting}
                    />
                </div>
                {formData.status === 'priv' && (
                    <div>
                        <label>Hasło do osiedla: </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={isLoading || isRedirecting}
                            placeholder="Wpisz hasło dla prywatnego osiedla"
                            required={formData.status === 'priv'}
                        />
                    </div>
                )}
                <button type="submit" disabled={isLoading || isRedirecting}>
                    {isLoading ? 'Tworzenie...' : 'Stwórz'}
                </button>
            </form>
            {message && (
                <div className={`group-creating-message ${message.includes('błąd') || message.includes('Błąd') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            {isRedirecting && (
                <div className="progress-bar-container">
                    <div className="progress-bar-fill"></div>
                </div>
            )}

            <button
                onClick={() => navigate('/home')}
                disabled={isLoading || isRedirecting}
                className="back-button"
            >
                Powrót do strony głównej
            </button>
        </div>
    );
};