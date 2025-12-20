import React, { useState, useEffect } from 'react';
import '../styles/AnnouncementsSection.css';
import { UserProfileModal } from './UserProfileModal';
import { RatingModal } from './RatingModal';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';

export enum AnnouncementType {
    HELP_REQUEST = 'HELP_REQUEST',
    HELP_OFFER = 'HELP_OFFER',
    INFO = 'INFO',
    EVENT = 'EVENT',
    LOST_FOUND = 'LOST_FOUND'
}

export enum AnnouncementStatus {
    ACTIVE = 'ACTIVE',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    EXPIRED = 'EXPIRED'
}

export interface AnnouncementResponse {
    id: string;
    userId: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
    };
    message?: string;
    isAccepted?: boolean;
    createdAt: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    status: AnnouncementStatus;
    authorId: string;
    author: {
        id: string;
        firstName: string;
        lastName: string;
    };
    neighborhoodId: string;
    expiresAt?: string;
    viewCount?: number;
    acceptedResponseId?: string;
    responses: AnnouncementResponse[];
    createdAt: string;
    updatedAt: string;
    isPinned: boolean;
}

interface AnnouncementsSectionProps {
    neighborhoodId: string;
    userId: string;
    isAdmin: boolean;
}

const TYPE_CONFIG = {
    [AnnouncementType.HELP_REQUEST]: { icon: '🆘', label: 'ann_type_help_request', color: '#ef4444' },
    [AnnouncementType.HELP_OFFER]: { icon: '🤝', label: 'ann_type_help_offer', color: '#22c55e' },
    [AnnouncementType.INFO]: { icon: 'ℹ️', label: 'ann_type_info', color: '#3b82f6' },
    [AnnouncementType.EVENT]: { icon: '📅', label: 'ann_type_event', color: '#a855f7' },
    [AnnouncementType.LOST_FOUND]: { icon: '🔍', label: 'ann_type_lost_found', color: '#f59e0b' },
};

const STATUS_CONFIG: Record<AnnouncementStatus, { label: string; color: string }> = {
    [AnnouncementStatus.ACTIVE]: { label: 'ann_status_active', color: '#22c55e' },
    [AnnouncementStatus.IN_PROGRESS]: { label: 'ann_status_in_progress', color: '#f59e0b' },
    [AnnouncementStatus.RESOLVED]: { label: 'ann_status_resolved', color: '#6b7280' },
    [AnnouncementStatus.EXPIRED]: { label: 'ann_status_expired', color: '#9ca3af' },
};

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
    neighborhoodId,
    userId,
    isAdmin,
}) => {
    const { t } = useSettings();
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState<AnnouncementType | 'ALL'>('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newType, setNewType] = useState<AnnouncementType>(AnnouncementType.INFO);
    const [isSubmitting, setIsSubmitting] = useState(false);

    
    const [responseMessage, setResponseMessage] = useState('');

    
    const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);
    const [ratingModalData, setRatingModalData] = useState<{
        toUserId: string;
        toUserName: string;
        announcementId: string;
        announcementTitle: string;
    } | null>(null);

    
    useEffect(() => {
        fetchAnnouncements();
    }, [neighborhoodId, filterType]);

    const fetchAnnouncements = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            let url = `http://localhost:3001/api/neighborhoods/${neighborhoodId}/announcements`;
            if (filterType !== 'ALL') {
                url += `?type=${filterType}`;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setAnnouncements(data);
            } else {
                setError(t('ann_error_fetch'));
            }
        } catch (err) {
            setError(t('common_connection_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setEditingAnnouncement(null);
        setNewTitle('');
        setNewContent('');
        setNewType(AnnouncementType.INFO);
        setShowCreateModal(true);
    };

    const handleOpenEditModal = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setNewTitle(announcement.title);
        setNewContent(announcement.content);
        setNewType(announcement.type);
        setShowCreateModal(true);
    };

    const handleSubmitAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');

            let url = `http://localhost:3001/api/neighborhoods/${neighborhoodId}/announcements`;
            let method = 'POST';

            if (editingAnnouncement) {
                url = `http://localhost:3001/api/announcements/${editingAnnouncement.id}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newTitle,
                    content: newContent,
                    type: newType,
                }),
            });

            if (response.ok) {
                setNewTitle('');
                setNewContent('');
                setNewType(AnnouncementType.INFO);
                setShowCreateModal(false);
                setEditingAnnouncement(null);
                fetchAnnouncements();
            } else {
                const data = await response.json();
                alert(data.message || (editingAnnouncement ? t('ann_error_fetch') : t('create_neigh_error_general'))); 
            }
        } catch (err) {
            alert(t('common_connection_error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateAnnouncement = handleSubmitAnnouncement; 

    const handleRespond = async (announcementId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3001/api/announcements/${announcementId}/respond`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ message: responseMessage }),
                }
            );

            if (response.ok) {
                setResponseMessage('');
                fetchAnnouncements();
            } else {
                const data = await response.json();
                alert(data.message || t('common_connection_error'));
            }
        } catch (err) {
            alert(t('common_connection_error'));
        }
    };

    const handleWithdrawResponse = async (announcementId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3001/api/announcements/${announcementId}/respond`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.ok) {
                fetchAnnouncements();
            } else {
                const data = await response.json();
                alert(data.message || t('common_connection_error'));
            }
        } catch (err) {
            alert(t('common_connection_error'));
        }
    };

    const handleAcceptOffer = async (announcementId: string, responseId: string) => {
        if (!window.confirm(t('ann_accept_confirm'))) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3001/api/announcements/${announcementId}/accept/${responseId}`,
                {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.ok) {
                fetchAnnouncements();
            } else {
                const data = await response.json();
                alert(data.message || t('common_connection_error'));
            }
        } catch (err) {
            alert(t('common_connection_error'));
        }
    };

    const handleRecordView = async (announcementId: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(
                `http://localhost:3001/api/announcements/${announcementId}/view`,
                {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
        } catch (err) {
            
        }
    };

    const handleUpdateStatus = async (announcementId: string, status: AnnouncementStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3001/api/announcements/${announcementId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status }),
                }
            );

            if (response.ok) {
                fetchAnnouncements();
            } else {
                const data = await response.json();
                alert(data.message || t('common_connection_error'));
            }
        } catch (err) {
            alert(t('common_connection_error'));
        }
    };

    const handleDelete = async (announcementId: string) => {
        if (!window.confirm(t('ann_delete_confirm'))) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3001/api/announcements/${announcementId}`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.ok) {
                fetchAnnouncements();
            } else {
                const data = await response.json();
                alert(data.message || t('common_connection_error'));
            }
        } catch (err) {
            alert(t('common_connection_error'));
        }
    };

    const handlePin = async (announcementId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3001/api/announcements/${announcementId}/pin`,
                {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.ok) {
                fetchAnnouncements();
            } else {
                const data = await response.json();
                alert(data.message || t('common_connection_error'));
            }
        } catch (err) {
            alert(t('common_connection_error'));
        }
    };

    const handleExpand = async (announcementId: string) => {
        if (expandedId === announcementId) {
            setExpandedId(null);
        } else {
            setExpandedId(announcementId);
            
            handleRecordView(announcementId);
        }
    };

    const hasUserResponded = (announcement: Announcement) => {
        return announcement.responses?.some(r => r.userId === userId);
    };

    const getAcceptedResponse = (announcement: Announcement) => {
        return announcement.responses?.find(r => r.isAccepted);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(t('appearance_language') === 'Język' ? 'pl-PL' : 'en-US', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="announcements-section">
            <div className="announcements-header">
                <h3>📢 {t('ann_title')}</h3>
                <button
                    className="create-announcement-btn"
                    onClick={handleOpenCreateModal}
                >
                    + {t('ann_add_btn')}
                </button>
            </div>

            {/* Filter tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filterType === 'ALL' ? 'active' : ''}`}
                    onClick={() => setFilterType('ALL')}
                >
                    {t('ann_filter_all')}
                </button>
                {Object.entries(TYPE_CONFIG).map(([type, config]) => (
                    <button
                        key={type}
                        className={`filter-tab ${filterType === type ? 'active' : ''}`}
                        onClick={() => setFilterType(type as AnnouncementType)}
                        style={{ '--tab-color': config.color } as React.CSSProperties}
                    >
                        {config.icon} {t(config.label)}
                    </button>
                ))}
            </div>

            {}
            {isLoading ? (
                <p className="loading-message">{t('ann_loading')}</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : announcements.length === 0 ? (
                <div className="empty-state">
                    <p>{t('ann_empty_title')}</p>
                    <p>{t('ann_empty_desc')}</p>
                </div>
            ) : (
                <div className="announcements-list">
                    {announcements.map((announcement) => {
                        const acceptedResponse = getAcceptedResponse(announcement);
                        return (
                            <div
                                key={announcement.id}
                                className={`announcement-card ${announcement.status !== AnnouncementStatus.ACTIVE ? 'inactive' : ''}`}
                            >
                                <div className="announcement-header">
                                    <span
                                        className="type-badge"
                                        style={{ backgroundColor: TYPE_CONFIG[announcement.type].color }}
                                    >
                                        {TYPE_CONFIG[announcement.type].icon} {t(TYPE_CONFIG[announcement.type].label)}
                                    </span>
                                    <span
                                        className="status-badge"
                                        style={{ color: STATUS_CONFIG[announcement.status].color }}
                                    >
                                        {t(STATUS_CONFIG[announcement.status].label)}
                                    </span>
                                    {announcement.isPinned && (
                                        <span className="pinned-badge" style={{ marginLeft: '10px', fontSize: '0.9em', color: '#e65100', fontWeight: 'bold' }}>
                                            📌 {t('ann_pinned') || 'Przypięte'}
                                        </span>
                                    )}
                                </div>

                                <h4 className="announcement-title">{announcement.title}</h4>
                                <p className="announcement-content">{announcement.content}</p>

                                {/* Show accepted helper for IN_PROGRESS status */}
                                {announcement.status === AnnouncementStatus.IN_PROGRESS && acceptedResponse && (
                                    <div className="accepted-helper-info">
                                        ✅ {t('ann_in_progress_info')} <strong>{acceptedResponse.user.firstName} {acceptedResponse.user.lastName}</strong>
                                    </div>
                                )}

                                <div className="announcement-meta">
                                    <span className="author">
                                        👤 <span
                                            className="author-name-link"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setProfileModalUserId(announcement.authorId);
                                            }}
                                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            {announcement.author.firstName} {announcement.author.lastName}
                                        </span>
                                        {announcement.authorId !== userId && (
                                            <button
                                                className="chat-author-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/messages?userId=${announcement.authorId}`);
                                                }}
                                                title={t('chat_search_placeholder')} 
                                            >
                                                💬
                                            </button>
                                        )}
                                    </span>
                                    <span className="date">
                                        🕐 {formatDate(announcement.createdAt)}
                                    </span>
                                    <span className="responses-count">
                                        💬 {announcement.responses?.length || 0} {t('ann_responses_count_label')}
                                    </span>
                                    {announcement.viewCount !== undefined && announcement.viewCount > 0 && (
                                        <span className="view-count">
                                            👁 {announcement.viewCount} {t('ann_views_count_label')}
                                        </span>
                                    )}
                                </div>

                                {}
                                <button
                                    className="expand-btn"
                                    onClick={() => handleExpand(announcement.id)}
                                >
                                    {expandedId === announcement.id ? '▲ ' + t('ann_details_hide') : '▼ ' + t('ann_details_show')}
                                </button>

                                {expandedId === announcement.id && (
                                    <div className="announcement-details">
                                        {/* Responses list */}
                                        {announcement.responses && announcement.responses.length > 0 && (
                                            <div className="responses-list">
                                                <h5>{t('ann_responses_header')}:</h5>
                                                {announcement.responses.map((resp) => (
                                                    <div key={resp.id} className={`response-item ${resp.isAccepted ? 'accepted' : ''}`}>
                                                        <div className="response-header">
                                                            <strong>{resp.user.firstName} {resp.user.lastName}</strong>
                                                            {resp.isAccepted && <span className="accepted-badge">✅ {t('ann_accepted_badge')}</span>}
                                                        </div>
                                                        {resp.message && <p>{resp.message}</p>}
                                                        <span className="response-date">{formatDate(resp.createdAt)}</span>

                                                        {/* Accept button for author */}
                                                        {announcement.authorId === userId &&
                                                            announcement.status === AnnouncementStatus.ACTIVE &&
                                                            !resp.isAccepted && (
                                                                <button
                                                                    className="action-btn accept"
                                                                    onClick={() => handleAcceptOffer(announcement.id, resp.id)}
                                                                >
                                                                    ✓ {t('ann_accept_btn')}
                                                                </button>
                                                            )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {}
                                        <div className="announcement-actions">
                                            {announcement.authorId === userId ? (
                                                <>
                                                    {announcement.status === AnnouncementStatus.ACTIVE && (
                                                        <button
                                                            className="action-btn resolve"
                                                            onClick={() => handleUpdateStatus(announcement.id, AnnouncementStatus.RESOLVED)}
                                                        >
                                                            ✓ {t('ann_resolve_btn')}
                                                        </button>
                                                    )}
                                                    {announcement.status === AnnouncementStatus.IN_PROGRESS && (
                                                        <button
                                                            className="action-btn resolve"
                                                            onClick={() => handleUpdateStatus(announcement.id, AnnouncementStatus.RESOLVED)}
                                                        >
                                                            ✓ {t('ann_resolve_finish_btn')}
                                                        </button>
                                                    )}
                                                    {(announcement.status === AnnouncementStatus.RESOLVED || announcement.status === AnnouncementStatus.IN_PROGRESS) && (
                                                        <button
                                                            className="action-btn restore"
                                                            onClick={() => handleUpdateStatus(announcement.id, AnnouncementStatus.ACTIVE)}
                                                        >
                                                            ↺ {t('ann_restore_btn')}
                                                        </button>
                                                    )}
                                                    {announcement.status === AnnouncementStatus.RESOLVED && acceptedResponse && (
                                                        <button
                                                            className="action-btn rate"
                                                            onClick={() => setRatingModalData({
                                                                toUserId: acceptedResponse.userId,
                                                                toUserName: `${acceptedResponse.user.firstName} ${acceptedResponse.user.lastName}`,
                                                                announcementId: announcement.id,
                                                                announcementTitle: announcement.title
                                                            })}
                                                        >
                                                            ⭐ {t('ann_rate_helper_btn')}
                                                        </button>
                                                    )}
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => handleOpenEditModal(announcement)}
                                                        style={{ backgroundColor: '#2196F3', color: 'white', marginRight: '5px' }}
                                                    >
                                                        ✏️ {t('ann_edit_btn')}
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDelete(announcement.id)}
                                                    >
                                                        🗑 {t('ann_delete_btn')}
                                                    </button>
                                                </>
                                            ) : announcement.status === AnnouncementStatus.ACTIVE && (
                                                hasUserResponded(announcement) ? (
                                                    <button
                                                        className="action-btn withdraw"
                                                        onClick={() => handleWithdrawResponse(announcement.id)}
                                                    >
                                                        ✗ {t('ann_withdraw_btn')}
                                                    </button>
                                                ) : (
                                                    <div className="respond-form">
                                                        <input
                                                            type="text"
                                                            placeholder={t('ann_respond_placeholder')}
                                                            value={responseMessage}
                                                            onChange={(e) => setResponseMessage(e.target.value)}
                                                        />
                                                        <button
                                                            className="action-btn respond"
                                                            onClick={() => handleRespond(announcement.id)}
                                                        >
                                                            🙋 {t('ann_respond_btn')}
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                            {announcement.status === AnnouncementStatus.IN_PROGRESS &&
                                                announcement.authorId !== userId && (
                                                    <p className="status-info">
                                                        ⏳ {t('ann_status_in_progress')}
                                                    </p>
                                                )}
                                            {announcement.status === AnnouncementStatus.RESOLVED &&
                                                announcement.authorId !== userId &&
                                                acceptedResponse?.userId === userId && (
                                                    <button
                                                        className="action-btn rate"
                                                        onClick={() => setRatingModalData({
                                                            toUserId: announcement.authorId,
                                                            toUserName: `${announcement.author.firstName} ${announcement.author.lastName}`,
                                                            announcementId: announcement.id,
                                                            announcementTitle: announcement.title
                                                        })}
                                                    >
                                                        ⭐ {t('ann_rate_author_btn')}
                                                    </button>
                                                )}


                                            {/* Admin Actions for non-author announcements */}
                                            {isAdmin && announcement.authorId !== userId && (
                                                <div className="admin-actions" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #eee' }}>
                                                    <button
                                                        className="action-btn pin"
                                                        onClick={() => handlePin(announcement.id)}
                                                        style={{ backgroundColor: announcement.isPinned ? '#ffcc80' : '#ffa726', color: 'white', marginRight: '5px' }}
                                                    >
                                                        📌 {announcement.isPinned ? (t('ann_unpin_btn') || 'Odepnij') : (t('ann_pin_btn') || 'Przypnij')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(announcement.id)}
                                                    >
                                                        🗑 {t('ann_delete_btn')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )
            }

            {}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{editingAnnouncement ? t('ann_modal_edit_title') : t('ann_modal_create_title')}</h3>
                        <form onSubmit={handleSubmitAnnouncement}>
                            <div className="form-group">
                                <label>{t('ann_modal_type_label')}:</label>
                                <div className="type-selector">
                                    {Object.entries(TYPE_CONFIG).map(([type, config]) => (
                                        <button
                                            key={type}
                                            type="button"
                                            className={`type-option ${newType === type ? 'selected' : ''}`}
                                            onClick={() => setNewType(type as AnnouncementType)}
                                            style={{ '--type-color': config.color } as React.CSSProperties}
                                        >
                                            {config.icon} {t(config.label)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t('ann_modal_title_label')}:</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder={t('ann_modal_title_placeholder')}
                                    required
                                    maxLength={255}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('ann_modal_content_label')}:</label>
                                <textarea
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    placeholder={t('ann_modal_content_placeholder')}
                                    required
                                    rows={4}
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    {t('common_cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
                                >
                                    {isSubmitting ? t('common_saving') : (editingAnnouncement ? t('ann_modal_save_btn') : t('ann_modal_add_btn'))}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* User Profile Modal */}
            {profileModalUserId && (
                <UserProfileModal
                    userId={profileModalUserId}
                    currentUserId={userId}
                    onClose={() => setProfileModalUserId(null)}
                />
            )}

            {}
            {ratingModalData && (
                <RatingModal
                    toUserId={ratingModalData.toUserId}
                    toUserName={ratingModalData.toUserName}
                    announcementId={ratingModalData.announcementId}
                    announcementTitle={ratingModalData.announcementTitle}
                    onClose={() => setRatingModalData(null)}
                    onSuccess={() => {
                        alert(t('profile_update_success'));
                        fetchAnnouncements();
                    }}
                />
            )}
        </div>
    );
};
