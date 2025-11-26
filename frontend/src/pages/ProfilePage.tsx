import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ProfilePage.css';

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: ''
    });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!user) {
        return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const updateData: any = {};
            if (formData.email) updateData.email = formData.email;
            if (formData.firstName) updateData.firstName = formData.firstName;
            if (formData.lastName) updateData.lastName = formData.lastName;
            if (formData.address) updateData.address = formData.address;

            if (Object.keys(updateData).length === 0) {
                setMessage('Wypełnij przynajmniej jedno pole');
                setIsLoading(false);
                return;
            }

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Profil został zaktualizowany!');
                if (updateUser && data.data) {
                    updateUser(data.data);
                }
                setFormData({
                    email: '',
                    firstName: '',
                    lastName: '',
                    address: ''
                });
            } else {
                setMessage(data.message || 'Wystąpił błąd podczas aktualizacji profilu');
            }
        } catch (error) {
            setMessage('Błąd połączenia z serwerem');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="profile-container">
            <div id="profile-data">
                <div>E-mail: {user.email}</div>
                <div>Imię: {user.firstName}</div>
                <div>Nazwisko: {user.lastName}</div>
                <div>Adres: {user.address || 'Nie ustawiono'}</div>
            </div>
            <div id="change-data">
                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Zmień email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="Zmień imię"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Zmień nazwisko"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="address"
                            placeholder="Ustaw adres domowy"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                    </button>
                </form>
                {message && <div className={`profile-message ${message.includes('błąd') || message.includes('Błąd') ? 'error' : 'success'}`}>{message}</div>}
            </div>
            <button onClick={() => navigate('/home')}>Powrót do Strony Głównej</button>
        </div>
    );
};