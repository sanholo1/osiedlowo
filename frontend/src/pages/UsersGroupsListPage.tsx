import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/UsersGroupsListPage.css';

interface Neighborhood {
    id: string;
    name: string;
    city: string;
    isPrivate: boolean;
    adminId: string;
    createdAt: string;
}

export const UsersGroupsListPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUserNeighborhoods();
    }, []);

    const fetchUserNeighborhoods = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/neighborhoods?mode=my', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNeighborhoods(data);
            } else {
                setError('Nie udało się pobrać listy osiedli');
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="home-container">
            <h2>Twoje osiedla</h2>

            {isLoading && <p>Ładowanie...</p>}

            {error && <p className="groups-list-error">{error}</p>}

            {!isLoading && neighborhoods.length === 0 && (
                <p>Nie należysz jeszcze do żadnego osiedla. Stwórz nowe lub dołącz do istniejącego!</p>
            )}

            <main>
                {neighborhoods.map((neighborhood) => (
                    <div key={neighborhood.id}>
                        <h3>{neighborhood.name}</h3>
                        <p>Miasto: {neighborhood.city}</p>
                        <p>Status: {neighborhood.isPrivate ? 'Prywatne 🔒' : 'Publiczne 🌍'}</p>
                        <button onClick={() => navigate(`/group?id=${neighborhood.id}`)}>
                            Wybierz
                        </button>
                    </div>
                ))}
            </main>

            <div className="groups-list-navigation">
                <button onClick={() => navigate('/home')}>
                    Powrót do strony głównej
                </button>
            </div>
        </div>
    );
};