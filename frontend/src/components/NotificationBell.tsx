import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NotificationBell.css';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export const NotificationBell: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); 
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/notifications/unread-count', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.count);
            }
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/notifications?limit=10', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        
        if (!notification.isRead) {
            try {
                const token = localStorage.getItem('token');
                await fetch(`http://localhost:3001/api/notifications/${notification.id}/read`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
            } catch (err) {
                console.error('Failed to mark as read:', err);
            }
        }

        
        if (notification.link) {
            setIsOpen(false);
            navigate(notification.link);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:3001/api/notifications/read-all', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Teraz';
        if (diffMins < 60) return `${diffMins} min temu`;
        if (diffHours < 24) return `${diffHours} godz. temu`;
        if (diffDays < 7) return `${diffDays} dni temu`;
        return date.toLocaleDateString('pl-PL');
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'NEW_ANNOUNCEMENT': return '📢';
            case 'NEW_RESPONSE': return '🙋';
            case 'OFFER_ACCEPTED': return '✅';
            case 'NEW_MESSAGE': return '💬';
            default: return '🔔';
        }
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button
                className="notification-bell-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Powiadomienia"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h4>Powiadomienia</h4>
                        {unreadCount > 0 && (
                            <button
                                className="mark-all-read-btn"
                                onClick={handleMarkAllAsRead}
                            >
                                Oznacz wszystkie
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <p className="no-notifications">Brak powiadomień</p>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <span className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className="notification-content">
                                        <div className="notification-title">{notification.title}</div>
                                        <div className="notification-message">{notification.message}</div>
                                        <div className="notification-time">{formatDate(notification.createdAt)}</div>
                                    </div>
                                    {!notification.isRead && <span className="unread-dot" />}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="notification-footer">
                        <button onClick={() => { setIsOpen(false); navigate('/notifications'); }}>
                            Zobacz wszystkie
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
