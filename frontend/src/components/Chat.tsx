import React, { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useSettings } from '../contexts/SettingsContext';
import { UserProfileModal } from './UserProfileModal';

interface Message {
    id: string;
    senderId: string;
    content: string;
    sender: {
        id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

interface ChatProps {
    conversationId: string;
    userId: string;
}

export const Chat: React.FC<ChatProps> = ({ conversationId, userId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const { t } = useSettings();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const newSocket = io('http://localhost:3001', {
            auth: { token }
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            newSocket.emit('join_conversation', { conversationId });
        });

        newSocket.on('joined_conversation', () => {
            loadMessages();
            newSocket.emit('mark_read', { conversationId });
        });

        newSocket.on('new_message', (message: Message) => {
            setMessages(prev => {
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
            });
            scrollToBottom();

            newSocket.emit('mark_read', { conversationId });
        });

        newSocket.on('error', (error: { message: string }) => {
            console.error('Chat socket error:', error.message || error);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        setSocket(newSocket);

    }, [conversationId]);

    const loadMessages = useCallback(async () => {
        if (!conversationId) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3001/api/chat/conversations/${conversationId}/messages`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                // Deduplicate messages by ID
                const uniqueMessages = Array.from(new Map(data.map((m: any) => [m.id, m])).values());
                setMessages(uniqueMessages as any);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }, [conversationId]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !socket || !isConnected) {
            return;
        }

        socket.emit('send_message', {
            conversationId,
            content: newMessage.trim()
        });

        setNewMessage('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
                flex: 1,
                overflowY: 'auto',
                backgroundColor: '#f5f5f5',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '10px'
            }}>
                {!isConnected && (
                    <p style={{ textAlign: 'center', color: '#999' }}>
                        {t('chat_connecting')}
                    </p>
                )}
                {messages.length === 0 && isConnected && (
                    <p style={{ textAlign: 'center', color: '#999' }}>
                        {t('chat_empty_state')}
                    </p>
                )}
                {messages.map((message) => (
                    <div
                        key={message.id}
                        style={{
                            marginBottom: '10px',
                            padding: '8px 12px',
                            backgroundColor: message.senderId === userId ? '#dcf8c6' : 'white',
                            borderRadius: '8px',
                            maxWidth: '70%',
                            marginLeft: message.senderId === userId ? 'auto' : '0',
                            marginRight: message.senderId === userId ? '0' : 'auto'
                        }}
                    >
                        <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '4px' }}>
                            <strong
                                onClick={() => setProfileModalUserId(message.senderId)}
                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                {message.senderId === userId
                                    ? t('chat_you')
                                    : `${message.sender.firstName} ${message.sender.lastName}`}
                            </strong>
                        </div>
                        <div>{message.content}</div>
                        <div style={{ fontSize: '0.75em', color: '#999', marginTop: '4px' }}>
                            {new Date(message.createdAt).toLocaleTimeString(t('appearance_language') === 'Język' ? 'pl-PL' : 'en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('chat_input_placeholder')}
                    style={{ flex: 1, padding: '8px' }}
                    disabled={!isConnected}
                />
                <button type="submit" disabled={!isConnected || !newMessage.trim()}>
                    {t('chat_send_btn')}
                </button>
            </form>

            {profileModalUserId && (
                <UserProfileModal
                    userId={profileModalUserId}
                    currentUserId={userId}
                    onClose={() => setProfileModalUserId(null)}
                />
            )}
        </div>
    );
};
