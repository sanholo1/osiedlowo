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

            {/* Podstawowe informacje */}
            <div className="group-info-section">
                <h3>Informacje o osiedlu</h3>
                <p><strong>Miasto:</strong> {neighborhood.city}</p>
                <p><strong>Status:</strong> {neighborhood.isPrivate ? 'Prywatne 🔒' : 'Publiczne 🌍'}</p>
                <p><strong>Data utworzenia:</strong> {new Date(neighborhood.createdAt).toLocaleDateString('pl-PL')}</p>
                <p><strong>Liczba członków:</strong> {neighborhood.members?.length || 0}</p>
                {isAdmin && <p className="admin-badge">✓ Jesteś administratorem tego osiedla</p>}
            </div>

            {/* Lista członków */}
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

            {/* Chat */}
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

            {/* Przyciski nawigacji */}
            <div className="navigation-buttons">
                <button onClick={() => navigate('/groupslist')}>
                    Powrót do listy osiedli
                </button>
                <button onClick={() => navigate('/home')}>
                    Strona główna
                </button>
                {isAdmin && (
                    <button className="delete-button">
                        Zarządzaj osiedlem
                    </button>
                )}
            </div>
        </div>
    );
};