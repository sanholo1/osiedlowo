import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Chat } from '../components/Chat';
import '../styles/GroupPage.css';

interface Member {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface Neighborhood {
    id: string;
    name: string;
    city: string;
    isPrivate: boolean;
    adminId: string;
    createdAt: string;
    members: Member[];
    inviteCode?: string;
}

export const GroupPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const neighborhoodId = searchParams.get('id');

    const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (neighborhoodId) {
            fetchNeighborhoodDetails();
            fetchConversationForNeighborhood();
        }
    }, [neighborhoodId]);

    const fetchNeighborhoodDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/neighborhoods/${neighborhoodId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNeighborhood(data);
            } else {
                setError('Nie udało się pobrać danych osiedla');
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchConversationForNeighborhood = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/chat/conversations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const conversations = await response.json();
                const neighborhoodConversation = conversations.find(
                    (conv: any) => conv.neighborhoodId === neighborhoodId
                );
                if (neighborhoodConversation) {
                    setConversationId(neighborhoodConversation.id);
                }
            }
        } catch (err) {
            console.error('Error fetching conversation:', err);
        }
    };

    const handleLeave = async () => {
        if (!neighborhoodId || !window.confirm('Czy na pewno chcesz opuścić to osiedle?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/neighborhoods/${neighborhoodId}/leave`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                navigate('/groupslist');
            } else {
                const data = await response.json();
                alert(data.message || 'Nie udało się opuścić osiedla');
            }
        } catch (err) {
            console.error('Error leaving neighborhood:', err);
            alert('Błąd połączenia z serwerem');
        }
    };

    const [showManagement, setShowManagement] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const handleChangePassword = async () => {
        if (!newPassword) {
            alert('Wprowadź nowe hasło');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/neighborhoods/${neighborhoodId}/password`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newPassword })
            });

            if (response.ok) {
                alert('Hasło zostało zmienione');
                setNewPassword('');
            } else {
                const data = await response.json();
                alert(data.message || 'Nie udało się zmienić hasła');
            }
        } catch (err) {
            console.error('Error changing password:', err);
            alert('Błąd połączenia z serwerem');
        }
    };

    const handleDelete = async () => {
        if (!neighborhoodId || !window.confirm('Czy na pewno chcesz trwale usunąć to osiedle? Tej operacji nie można cofnąć.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/neighborhoods/${neighborhoodId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                navigate('/groupslist');
            } else {
                const data = await response.json();
                alert(data.message || 'Nie udało się usunąć osiedla');
            }
        } catch (err) {
            console.error('Error deleting neighborhood:', err);
            alert('Błąd połączenia z serwerem');
        }
    };

    if (!user) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="home-container">
                <p>Ładowanie...</p>
            </div>
        );
    }

    if (error || !neighborhood) {
        return (
            <div className="home-container">
                <p className="error-message">{error || 'Nie znaleziono osiedla'}</p>
                <button onClick={() => navigate('/groupslist')}>Powrót do listy osiedli</button>
            </div>
        );
    }

    const isAdmin = neighborhood.adminId === user.id;

    return (
        <div className="home-container">
            <h2>{neighborhood.name}</h2>

            <div className="group-info-section">
                <h3>Informacje o osiedlu</h3>
                <p><strong>Miasto:</strong> {neighborhood.city}</p>
                <p><strong>Status:</strong> {neighborhood.isPrivate ? 'Prywatne 🔒' : 'Publiczne 🌍'}</p>
                <p><strong>Data utworzenia:</strong> {new Date(neighborhood.createdAt).toLocaleDateString('pl-PL')}</p>
                <p><strong>Liczba członków:</strong> {neighborhood.members?.length || 0}</p>
                {isAdmin && <p className="admin-badge">✓ Jesteś administratorem tego osiedla</p>}
            </div>

            {isAdmin && showManagement && (
                <div style={{
                    backgroundColor: '#fff3e0',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #ffcc80'
                }}>
                    <h3>Zarządzanie osiedlem</h3>
                    <p>Tutaj możesz zarządzać ustawieniami osiedla.</p>

                    {neighborhood.isPrivate && neighborhood.inviteCode && (
                        <div style={{ margin: '15px 0', padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px dashed #ccc' }}>
                            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Kod zaproszenia:</p>
                            <code style={{ fontSize: '1.2em', color: '#d32f2f' }}>{neighborhood.inviteCode}</code>
                            <p style={{ fontSize: '0.8em', color: '#666', margin: '5px 0 0 0' }}>Podaj ten kod osobom, które chcesz zaprosić do osiedla.</p>
                        </div>
                    )}

                    {neighborhood.isPrivate && (
                        <div style={{ margin: '15px 0', padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Zmień hasło:</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="password"
                                    placeholder="Nowe hasło"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                                <button
                                    onClick={handleChangePassword}
                                    style={{
                                        backgroundColor: '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        padding: '5px 10px'
                                    }}
                                >
                                    Zapisz
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleDelete}
                        style={{
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        Usuń osiedle trwale
                    </button>
                </div>
            )}

            <div className="members-section">
                <h3>Członkowie osiedla ({neighborhood.members?.length || 0})</h3>
                {neighborhood.members && neighborhood.members.length > 0 ? (
                    <ul className="members-list">
                        {neighborhood.members.map((member) => (
                            <li key={member.id} className="member-item">
                                <strong>{member.firstName} {member.lastName}</strong>
                                {member.id === neighborhood.adminId && <span className="member-admin-badge">👑 Administrator</span>}
                                {member.id === user.id && <span className="member-you-badge">(Ty)</span>}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Brak członków</p>
                )}
            </div>

            <div className="chat-section">
                <h3>Chat osiedla</h3>
                <div className="chat-container">
                    {conversationId ? (
                        <Chat conversationId={conversationId} userId={user.id} />
                    ) : (
                        <p className="loading-message">
                            Ładowanie czatu...
                        </p>
                    )}
                </div>
            </div>

            <div className="navigation-buttons">
                <button onClick={() => navigate('/groupslist')}>
                    Powrót do listy osiedli
                </button>
                <button onClick={() => navigate('/home')}>
                    Strona główna
                </button>
                {!isAdmin && (
                    <button
                        onClick={handleLeave}
                        style={{ backgroundColor: '#f44336' }}
                    >
                        Opuść osiedle
                    </button>
                )}
                {isAdmin && (
                    <button
                        className="delete-button"
                        onClick={() => setShowManagement(!showManagement)}
                    >
                        {showManagement ? 'Ukryj zarządzanie' : 'Zarządzaj osiedlem'}
                    </button>
                )}
            </div>
        </div>
    );
};