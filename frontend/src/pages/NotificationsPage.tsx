import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import '../styles/NotificationsPage.css';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useSettings();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/notifications?limit=100', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setIsLoading(false);
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
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
            } catch (err) {
                console.error('Failed to mark as read:', err);
            }
        }

        if (notification.link) {
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
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(t('appearance_language') === 'Język' ? 'pl-PL' : 'en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'NEW_ANNOUNCEMENT': return { icon: '📢', label: t('notifications_type_announcement') };
            case 'NEW_RESPONSE': return { icon: '🙋', label: t('notifications_type_response') };
            case 'OFFER_ACCEPTED': return { icon: '✅', label: t('notifications_type_accepted') };
            case 'NEW_MESSAGE': return { icon: '💬', label: t('notifications_type_message') };
            case 'SYSTEM_ANNOUNCEMENT': return { icon: '📣', label: 'Ogłoszenie systemowe' };
            default: return { icon: '🔔', label: t('notifications_type_default') };
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="notifications-page">
            <div className="notifications-container">
                <div className="notifications-header">
                    <h1>🔔 {t('notifications_title')}</h1>
                    {unreadCount > 0 && (
                        <button
                            className="mark-all-btn"
                            onClick={handleMarkAllAsRead}
                        >
                            {t('notifications_mark_all_read')}
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <p className="loading">{t('notifications_loading')}</p>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">🔔</span>
                        <p>{t('notifications_empty')}</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <span className="notification-icon" title={getNotificationIcon(notification.type).label}>
                                    {getNotificationIcon(notification.type).icon}
                                </span>
                                <div className="notification-body">
                                    <div className="notification-title">{notification.title}</div>
                                    <div className="notification-message">{notification.message}</div>
                                    <div className="notification-date">{formatDate(notification.createdAt)}</div>
                                </div>
                                {!notification.isRead && <span className="unread-indicator" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
