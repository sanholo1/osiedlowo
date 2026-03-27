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

export const SearchForGroupPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useSettings();
    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPublicNeighborhoods();
    }, []);

    const fetchPublicNeighborhoods = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/neighborhoods?mode=public', {
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

    const handleJoin = async (neighborhoodId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/neighborhoods/${neighborhoodId}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (response.ok) {
                setNeighborhoods(prev => prev.filter(n => n.id !== neighborhoodId));
            } else {
                const data = await response.json();
                alert(data.message || t('search_join_error'));
            }
        } catch (err) {
            console.error('Error joining neighborhood:', err);
            alert(t('common_connection_error'));
        }
    };

    const handleJoinByCode = async () => {
        const code = prompt(t('search_code_prompt'));
        if (!code) return;

        const joinWithPassword = async (password?: string) => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3001/api/neighborhoods/join-by-code', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ inviteCode: code, password })
                });

                if (response.ok) {
                    alert(t('search_join_success'));
                    navigate('/groupslist');
                } else {
                    const data = await response.json();
                    if (data.code === 'PASSWORD_REQUIRED') {
                        const pass = prompt(t('search_password_prompt'));
                        if (pass) {
                            await joinWithPassword(pass);
                        }
                    } else {
                        alert(data.message || t('search_join_error'));
                    }
                }
            } catch (err) {
                console.error('Error joining by code:', err);
                alert(t('common_connection_error'));
            }
        };

        await joinWithPassword();
    };

    const [nameFilter, setNameFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    const filteredNeighborhoods = neighborhoods.filter(n => {
        const matchesName = n.name.toLowerCase().includes(nameFilter.toLowerCase());
        const matchesCity = n.city.toLowerCase().includes(cityFilter.toLowerCase());
        return matchesName && matchesCity;
    });

    if (!user) {
        return null;
    }

    return (
        <div className="home-container">
            <div className="groups-list-navigation" style={{ marginBottom: '20px', textAlign: 'left' }}>
                <button onClick={() => navigate('/home')}>
                    {t('back_home')}
                </button>
            </div>

            <h2>{t('search_title')}</h2>

            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <button
                    onClick={handleJoinByCode}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    {t('search_join_by_code_btn')}
                </button>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <input
                    type="text"
                    placeholder={t('search_filter_name')}
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <input
                    type="text"
                    placeholder={t('search_filter_city')}
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
            </div>

            {isLoading && <p>{t('common_loading')}</p>}

            {error && <p className="groups-list-error">{error}</p>}

            {!isLoading && filteredNeighborhoods.length === 0 && (
                <p>{t('search_empty')}</p>
            )}

            <main style={{ flexDirection: 'column', alignItems: 'stretch', width: '100%', maxWidth: '800px' }}>
                {filteredNeighborhoods.map((neighborhood) => (
                    <div key={neighborhood.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '20px',
                        marginBottom: '15px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        backgroundColor: '#0D2249',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        width: '100%',
                        minHeight: 'auto'
                    }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', color: '#BDD2FA', textAlign: 'center' }}>{neighborhood.name}</h3>
                            <p style={{ margin: '10px', color: '#BDD2FA' }}>{t('neigh_city')}: {neighborhood.city}</p>
                        </div>
                        <button
                            onClick={() => handleJoin(neighborhood.id)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            {t('search_join_btn')}
                        </button>
                    </div>
                ))}
            </main>
        </div>
    );
};