import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { io } from 'socket.io-client';
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
    const [conversations, setConversations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadPageData = async () => {
            await Promise.all([
                fetchUserNeighborhoods(),
                fetchConversations()
            ]);
            setIsLoading(false);
        };
        loadPageData();

        const token = localStorage.getItem('token');
        const socket = io('http://localhost:3001', {
            auth: { token }
        });

        socket.on('new_message', (message: any) => {
            setConversations(prev => {
                return prev.map(c => {
                    if (c.id === message.conversationId) {
                        return { ...c, unreadCount: (c.unreadCount || 0) + (message.senderId !== user?.id ? 1 : 0) };
                    }
                    return c;
                });
            });
        });

        socket.on('messages_read', (data: { conversationId: string, userId: string }) => {
            if (data.userId === user?.id) {
                setConversations(prev => {
                    return prev.map(c => {
                        if (c.id === data.conversationId) {
                            return { ...c, unreadCount: 0 };
                        }
                        return c;
                    });
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user?.id]);

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
        }
    };

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/chat/conversations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setConversations(data);
            }
        } catch (err) {
            console.error('Error fetching conversations:', err);
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
                {neighborhoods.map((neighborhood) => {
                    const conversation = conversations.find(c => c.neighborhoodId === neighborhood.id);
                    const unreadCount = conversation?.unreadCount || 0;

                    return (
                        <div key={neighborhood.id} style={{
                            marginBottom: '15px',
                            padding: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            position: 'relative',
                            backgroundColor: unreadCount > 0 ? '#f0f7ff' : 'white',
                            borderColor: unreadCount > 0 ? '#667eea' : '#ddd'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3>{neighborhood.name}</h3>
                                {unreadCount > 0 && (
                                    <div style={{
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        fontSize: '12px',
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <span>💬 {unreadCount} nieprzeczytane</span>
                                    </div>
                                )}
                            </div>
                            <p>{t('neigh_city')}: {neighborhood.city}</p>
                            <p>{t('neigh_status')}: {neighborhood.isPrivate ? t('neigh_status_private') : t('neigh_status_public')}</p>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button
                                    onClick={() => navigate(`/group?id=${neighborhood.id}`)}
                                    style={{
                                        backgroundColor: unreadCount > 0 ? '#667eea' : undefined,
                                        color: unreadCount > 0 ? 'white' : undefined
                                    }}
                                >
                                    {t('neigh_select_btn')}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </main>

            <div className="groups-list-navigation">
                <button onClick={() => navigate('/home')}>
                    {t('back_home')}
                </button>
            </div>
        </div>
    );
};