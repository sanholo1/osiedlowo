import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
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
    const { t } = useSettings();
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
                setError(t('neigh_list_error_fetch'));
            }
        } catch (err) {
            setError(t('common_connection_error'));
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="home-container">
            <h2>{t('neigh_list_title')}</h2>

            {isLoading && <p>{t('common_loading')}</p>}

            {error && <p className="groups-list-error">{error}</p>}

            {!isLoading && neighborhoods.length === 0 && (
                <p>{t('neigh_list_empty')}</p>
            )}

            <main>
                {neighborhoods.map((neighborhood) => (
                    <div key={neighborhood.id} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                        <h3>{neighborhood.name}</h3>
                        <p>{t('neigh_city')}: {neighborhood.city}</p>
                        <p>{t('neigh_status')}: {neighborhood.isPrivate ? t('neigh_status_private') : t('neigh_status_public')}</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button onClick={() => navigate(`/group?id=${neighborhood.id}`)}>
                                {t('neigh_select_btn')}
                            </button>
                        </div>
                    </div>
                ))}
            </main>

            <div className="groups-list-navigation">
                <button onClick={() => navigate('/home')}>
                    {t('back_home')}
                </button>
            </div>
        </div>
    );
};