import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Chat } from '../components/Chat';
import { useSettings } from '../contexts/SettingsContext';
import { chatService } from '../services/chat.service';
import { io, Socket } from 'socket.io-client';
import '../styles/UsersGroupsListPage.css';
import '../styles/DirectMessagesPage.css';

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
            const data = await chatService.getConversations();
            setConversations(data);
        } catch (err) {
            console.error('Error fetching conversations:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            const data = await chatService.searchUsers(searchQuery);
            setSearchResults(data);
        } catch (err) {
            console.error('Error searching users:', err);
        }
    };

    const startConversation = async (otherUserId: string) => {
        try {
            const conversation = await chatService.startConversation([otherUserId]);

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
        } catch (err: any) {
            console.error('Error starting conversation:', err);
            // Assuming error handling logic aligns with what axios throws
            const errorMessage = err.response?.data?.message || err.message;
            alert(`${t('chat_start_error')}: ${errorMessage}`);
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
            await chatService.deleteConversation(conversationId);
            setConversations(prev => prev.filter(c => c.id !== conversationId));
            if (selectedConversationId === conversationId) {
                setSelectedConversationId(null);
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
        <div className="home-container dm-page-container">
            <div className="dm-header">
                <div className="dm-header-left">
                    <button
                        onClick={handleBack}
                        className="dm-back-btn"
                    >
                        &larr; {selectedConversationId ? t('chat_back_to_list') : t('back_home')}
                    </button>
                    <h2 className="dm-title">
                        {selectedConversationId ? t('chat_title_individual') : t('chat_title_list')}
                    </h2>
                </div>
                {selectedConversationId && (
                    <button
                        onClick={() => handleDeleteConversation(selectedConversationId)}
                        className="dm-delete-btn"
                    >
                        🗑️ {t('chat_delete_btn')}
                    </button>
                )}
            </div>

            <div className="dm-content-layout">
                {selectedConversationId ? (
                    <div className="dm-chat-view">
                        <Chat conversationId={selectedConversationId} userId={user.id} />
                    </div>
                ) : (
                    <div className="dm-list-view">
                        <div className="dm-search-container">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('chat_search_placeholder')}
                                className="dm-search-input"
                            />
                        </div>

                        <div className="dm-list-scroll">
                            {searchQuery.length >= 2 ? (
                                <div>
                                    <div className="dm-search-results-label">
                                        {t('chat_search_results')}
                                    </div>
                                    {searchResults.map(resultUser => (
                                        <div
                                            key={resultUser.id}
                                            onClick={() => startConversation(resultUser.id)}
                                            className="dm-user-item"
                                        >
                                            <div className="dm-avatar-placeholder">
                                                {resultUser.firstName[0]}
                                            </div>
                                            <div>
                                                <div className="dm-user-info-name">{resultUser.firstName} {resultUser.lastName}</div>
                                                <div className="dm-user-info-email">{resultUser.email}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {searchResults.length === 0 && (
                                        <div className="dm-no-results">
                                            {t('chat_no_users_found')}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {isLoading && <p className="dm-loading">{t('common_loading')}</p>}
                                    {!isLoading && conversations.length === 0 && (
                                        <p className="dm-empty-list">
                                            {t('chat_empty_list')}
                                        </p>
                                    )}
                                    {conversations.map(conversation => {
                                        const otherUser = getOtherParticipant(conversation);
                                        const isGroup = conversation.type === 'group';
                                        const unreadCount = conversation.unreadCount ?? 0;

                                        return (
                                            <div
                                                key={conversation.id}
                                                onClick={() => handleSelectConversation(conversation.id)}
                                                className="dm-conversation-item"
                                            >
                                                <div
                                                    className="dm-conversation-avatar"
                                                    style={{ backgroundColor: isGroup ? '#42b72a' : '#1877f2' }}
                                                >
                                                    {isGroup ? '🏠' : (otherUser?.firstName?.[0] || '?')}
                                                    {unreadCount > 0 && (
                                                        <div className="dm-unread-badge">
                                                            {unreadCount}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="dm-conversation-info">
                                                    <div className="dm-conversation-header">
                                                        <span>
                                                            {isGroup
                                                                ? (conversation.name || t('neigh_chat_title') || 'Chat Osiedlowy')
                                                                : (otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : t('chat_unknown_user'))
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className={`dm-conversation-date ${unreadCount > 0 ? 'dm-text-unread' : 'dm-text-read'}`}>
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
