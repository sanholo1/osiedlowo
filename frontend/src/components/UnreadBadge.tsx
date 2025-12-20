import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import './UnreadBadge.css';

interface UnreadBadgeProps {
    className?: string;
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({ className = '' }) => {
    const [count, setCount] = useState(0);
    const [socket, setSocket] = useState<Socket | null>(null);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('http://localhost:3001/api/chat/unread-count', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCount(data.count);
            }
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    };

    useEffect(() => {
        
        fetchUnreadCount();

        
        const token = localStorage.getItem('token');
        if (token) {
            const newSocket = io('http://localhost:3001', {
                auth: { token }
            });

            newSocket.on('connect', () => {
                console.log('UnreadBadge: Socket connected');
            });

            
            newSocket.on('new_message', () => {
                fetchUnreadCount();
            });

            
            newSocket.on('messages_read', () => {
                fetchUnreadCount();
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, []);

    if (count === 0) {
        return null;
    }

    return (
        <span className={`unread-badge ${className}`}>
            {count > 99 ? '99+' : count}
        </span>
    );
};
