import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Chat } from '../components/Chat';
import '../styles/UsersGroupsListPage.css';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface Conversation {
    id: string;
    type: 'private' | 'group';
    name?: string;
    participants: User[];
    updatedAt: string;
}

export const DirectMessagesPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (searchQuery.length >= 2) {
            handleSearch();
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

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
                const privateConversations = data.filter((c: Conversation) => c.type === 'private');
                setConversations(privateConversations);
            } else {
                setError('Nie udało się pobrać rozmów');
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/chat/users/search?q=${searchQuery}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            }
        } catch (err) {
            console.error('Error searching users:', err);
        }
    };

    const startConversation = async (otherUserId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/chat/conversations', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'private',
                    participantIds: [otherUserId]
                })
            });

            if (response.ok) {
                const conversation = await response.json();
                if (!conversations.find(c => c.id === conversation.id)) {
                    setConversations(prev => [conversation, ...prev]);
                }
                setSelectedConversationId(conversation.id);
                setSearchQuery('');
                setSearchResults([]);
            } else {
                alert('Nie udało się rozpocząć rozmowy');
            }
        } catch (err) {
            console.error('Error starting conversation:', err);
            alert('Błąd połączenia z serwerem');
        }
    };

    const getOtherParticipant = (conversation: Conversation) => {
        return conversation.participants.find(p => p.id !== user?.id);
    };

    const handleBack = () => {
        if (selectedConversationId) {
            setSelectedConversationId(null);
        } else {
            navigate('/home');
        }
    };

    if (!user) return null;

    return (
        <div className="home-container" style={{ height: '100vh', flexDirection: 'column', justifyContent: 'flex-start', backgroundColor: '#f0f2f5', padding: 0 }}>
            <div style={{
                width: '100%',
                padding: '10px 20px',
                backgroundColor: 'white',
                borderBottom: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                height: '60px',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <button
                    onClick={handleBack}
                    style={{
                        marginRight: '20px',
                        padding: '8px 16px',
                        backgroundColor: '#e4e6eb',
                        color: 'black',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    &larr; {selectedConversationId ? 'Wróć do listy' : 'Wróć do strony głównej'}
                </button>
                <h2 style={{ margin: 0, fontSize: '24px', color: '#050505' }}>
                    {selectedConversationId ? 'Czat' : 'Wiadomości'}
                </h2>
            </div>

            <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
                {selectedConversationId ? (
                    <div style={{ flex: 1, backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
                        <Chat conversationId={selectedConversationId} userId={user.id} />
                    </div>
                ) : (
                    <div style={{ flex: 1, backgroundColor: 'white', display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}>
                        <div style={{ padding: '10px 16px' }}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Szukaj użytkownika..."
                                style={{
                                    width: '100%',
                                    padding: '10px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    backgroundColor: '#f0f2f5',
                                    fontSize: '15px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {searchQuery.length >= 2 ? (
                                <div>
                                    <div style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 'bold', color: '#65676b' }}>
                                        WYNIKI WYSZUKIWANIA
                                    </div>
                                    {searchResults.map(resultUser => (
                                        <div
                                            key={resultUser.id}
                                            onClick={() => startConversation(resultUser.id)}
                                            style={{
                                                padding: '10px 16px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#555' }}>
                                                {resultUser.firstName[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: '#050505' }}>{resultUser.firstName} {resultUser.lastName}</div>
                                                <div style={{ fontSize: '13px', color: '#65676b' }}>{resultUser.email}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {searchResults.length === 0 && (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#65676b' }}>
                                            Nie znaleziono użytkowników
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {isLoading && <p style={{ padding: '20px', textAlign: 'center' }}>Ładowanie...</p>}
                                    {!isLoading && conversations.length === 0 && (
                                        <p style={{ padding: '20px', textAlign: 'center', color: '#65676b' }}>
                                            Brak wiadomości. Wyszukaj kogoś, aby rozpocząć rozmowę!
                                        </p>
                                    )}
                                    {conversations.map(conversation => {
                                        const otherUser = getOtherParticipant(conversation);
                                        return (
                                            <div
                                                key={conversation.id}
                                                onClick={() => setSelectedConversationId(conversation.id)}
                                                style={{
                                                    padding: '10px 16px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                                                    {otherUser?.firstName[0]}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 'bold', color: '#050505' }}>
                                                        {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Nieznany użytkownik'}
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#65676b' }}>
                                                        {new Date(conversation.updatedAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
