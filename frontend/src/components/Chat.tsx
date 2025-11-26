import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

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
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const newSocket = io('http://localhost:3001', {
            auth: { token }
        });

        newSocket.on('connect', () => {
            console.log('Connected to chat');
            setIsConnected(true);
            newSocket.emit('join_conversation', { conversationId });
        });

        newSocket.on('joined_conversation', () => {
            console.log('Joined conversation');
            loadMessages();
        });

        newSocket.on('new_message', (message: Message) => {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
        });

        newSocket.on('error', (error: { message: string }) => {
            console.error('Socket error:', error);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [conversationId]);

    const loadMessages = async () => {
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
                setMessages(data);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

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
                        Łączenie z czatem...
                    </p>
                )}
                {messages.length === 0 && isConnected && (
                    <p style={{ textAlign: 'center', color: '#999' }}>
                        Brak wiadomości. Rozpocznij rozmowę!
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
                            <strong>
                                {message.senderId === userId
                                    ? 'Ty'
                                    : `${message.sender.firstName} ${message.sender.lastName}`}
                            </strong>
                        </div>
                        <div>{message.content}</div>
                        <div style={{ fontSize: '0.75em', color: '#999', marginTop: '4px' }}>
                            {new Date(message.createdAt).toLocaleTimeString('pl-PL', {
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
                    placeholder="Wpisz wiadomość..."
                    style={{ flex: 1, padding: '8px' }}
                    disabled={!isConnected}
                />
                <button type="submit" disabled={!isConnected || !newMessage.trim()}>
                    Wyślij
                </button>
            </form>
        </div>
    );
};
