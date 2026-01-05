import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Chat } from '../components/Chat';
import { useSettings } from '../contexts/SettingsContext';
import { io, Socket } from 'socket.io-client';
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
    unreadCount?: number;
}

export const DirectMessagesPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { t } = useSettings();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        fetchConversations();

        const token = localStorage.getItem('token');
        const newSocket = io('http://localhost:3001', {
            auth: { token }
        });

        newSocket.on('new_message', (message: any) => {
            setConversations(prev => {
                const conversationIndex = prev.findIndex(c => c.id === message.conversationId);
                if (conversationIndex === -1) {
                    // If conversation doesn't exist in list yet, we might need to fetch it or ignore
                    // For now, let's just trigger a re-fetch if it's a new conversation
                    fetchConversations();
                    return prev;
                }

                const updatedConversations = [...prev];
                const conv = { ...updatedConversations[conversationIndex] };

                // Only increment if we are not the sender
                if (message.senderId !== user?.id) {
                    conv.unreadCount = (conv.unreadCount || 0) + 1;
                }
                conv.updatedAt = message.createdAt;

                updatedConversations.splice(conversationIndex, 1);
                updatedConversations.unshift(conv);
                return updatedConversations;
            });
        });

        newSocket.on('messages_read', (data: { conversationId: string, userId: string }) => {
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

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user?.id]);


    useEffect(() => {
        const targetUserId = searchParams.get('userId');
        if (targetUserId && !isLoading) {
            startConversation(targetUserId);

            navigate('/messages', { replace: true });
        }

    }, [searchParams, isLoading]);


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
                setConversations(data);
            }
        } catch (err) {
            console.error('Error fetching conversations:', err);
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


                if (!conversation.participants || conversation.participants.length === 0) {
                    const otherUser = searchResults.find(u => u.id === otherUserId);
                    if (otherUser && user) {
                        conversation.participants = [
                            { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
                            otherUser
                        ];
                    }
                }

                if (!conversations.find(c => c.id === conversation.id)) {
                    setConversations(prev => [conversation, ...prev]);
                }
                setSelectedConversationId(conversation.id);
                setSearchQuery('');
                setSearchResults([]);
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || response.statusText;
                console.error('Failed to start conversation:', response.status, errorData);
                alert(`${t('chat_start_error')}: ${errorMessage} (${response.status})`);
            }
        } catch (err) {
            console.error('Error starting conversation:', err);
            alert(t('common_connection_error'));
        }
    };

    const getOtherParticipant = (conversation: Conversation) => {
        if (!conversation.participants || conversation.participants.length === 0) {
            return undefined;
        }
        return conversation.participants.find(p => p.id !== user?.id);
    };

    const handleSelectConversation = (conversationId: string) => {
        // Optimistically clear the unread count when opening a conversation
        setConversations(prev => prev.map(c => {
            if (c.id === conversationId) {
                return { ...c, unreadCount: 0 };
            }
            return c;
        }));
        setSelectedConversationId(conversationId);
    };

    const handleDeleteConversation = async (conversationId: string) => {
        if (!window.confirm(t('chat_delete_confirm'))) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/chat/conversations/${conversationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setConversations(prev => prev.filter(c => c.id !== conversationId));
                if (selectedConversationId === conversationId) {
                    setSelectedConversationId(null);
                }
            } else {
                alert(t('chat_delete_error'));
            }
        } catch (err) {
            console.error('Error deleting conversation:', err);
            alert(t('common_connection_error'));
        }
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
                justifyContent: 'space-between',
                height: '60px',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
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
                        &larr; {selectedConversationId ? t('chat_back_to_list') : t('back_home')}
                    </button>
                    <h2 style={{ margin: 0, fontSize: '24px', color: '#050505' }}>
                        {selectedConversationId ? t('chat_title_individual') : t('chat_title_list')}
                    </h2>
                </div>
                {selectedConversationId && (
                    <button
                        onClick={() => handleDeleteConversation(selectedConversationId)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#ffebee',
                            color: '#d32f2f',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        🗑️ {t('chat_delete_btn')}
                    </button>
                )}
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
                                placeholder={t('chat_search_placeholder')}
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
                                        {t('chat_search_results')}
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
                                            {t('chat_no_users_found')}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {isLoading && <p style={{ padding: '20px', textAlign: 'center' }}>{t('common_loading')}</p>}
                                    {!isLoading && conversations.length === 0 && (
                                        <p style={{ padding: '20px', textAlign: 'center', color: '#65676b' }}>
                                            {t('chat_empty_list')}
                                        </p>
                                    )}
                                    {conversations.map(conversation => {
                                        const otherUser = getOtherParticipant(conversation);
                                        const isGroup = conversation.type === 'group';
                                        return (
                                            <div
                                                key={conversation.id}
                                                onClick={() => handleSelectConversation(conversation.id)}
                                                style={{
                                                    padding: '10px 16px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    transition: 'background-color 0.2s',
                                                    position: 'relative'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <div style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: '50%',
                                                    backgroundColor: isGroup ? '#42b72a' : '#1877f2',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '20px',
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                    position: 'relative'
                                                }}>
                                                    {isGroup ? '🏠' : (otherUser?.firstName?.[0] || '?')}
                                                    {(conversation.unreadCount ?? 0) > 0 && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '-2px',
                                                            right: '-2px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            fontSize: '10px',
                                                            padding: '2px 6px',
                                                            borderRadius: '10px',
                                                            border: '2px solid white',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {conversation.unreadCount}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 'bold', color: '#050505', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span>
                                                            {isGroup
                                                                ? (conversation.name || t('neigh_chat_title') || 'Chat Osiedlowy')
                                                                : (otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : t('chat_unknown_user'))
                                                            }
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: (conversation.unreadCount ?? 0) > 0 ? '#1877f2' : '#65676b', fontWeight: (conversation.unreadCount ?? 0) > 0 ? 'bold' : 'normal' }}>
                                                        {new Date(conversation.updatedAt).toLocaleDateString(t('appearance_language') === 'Język' ? 'pl-PL' : 'en-US')}
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
