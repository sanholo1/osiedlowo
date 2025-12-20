import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import '../styles/GroupCreatingPage.css';

export const GroupCreatingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useSettings();
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
            setMessage(t('create_neigh_error_required'));
            setIsLoading(false);
            return;
        }

        if (formData.status === 'priv' && !formData.password.trim()) {
            setMessage(t('create_neigh_error_password'));
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
                setMessage(t('create_neigh_success'));
                setIsRedirecting(true);
                setTimeout(() => {
                    navigate('/groupslist');
                }, 2000);
            } else {
                setMessage(data.message || t('create_neigh_error_general'));
            }
        } catch (error) {
            setMessage(t('common_connection_error'));
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
            <h2>{t('create_neigh_title')}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>{t('create_neigh_name_label')}: </label>
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
                    <label>{t('create_neigh_city_label')}: </label>
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
                    <h3>{t('create_neigh_status_label')}:</h3>
                    <label>{t('create_neigh_status_public')}</label>
                    <input
                        type="radio"
                        name="status"
                        id="neigh-pub"
                        value="pub"
                        checked={formData.status === 'pub'}
                        onChange={handleInputChange}
                        disabled={isLoading || isRedirecting}
                    />
                    <label>{t('create_neigh_status_private')}</label>
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
                        <label>{t('create_neigh_password_label')}: </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={isLoading || isRedirecting}
                            placeholder={t('create_neigh_password_placeholder')}
                            required={formData.status === 'priv'}
                        />
                    </div>
                )}
                <button type="submit" disabled={isLoading || isRedirecting}>
                    {isLoading ? t('create_neigh_loading') : t('create_neigh_submit')}
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
                {t('back_home')}
            </button>
        </div>
    );
};