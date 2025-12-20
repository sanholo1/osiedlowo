import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Chat } from '../components/Chat';
import { AnnouncementsSection } from '../components/AnnouncementsSection';
import { useSettings } from '../contexts/SettingsContext';
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
    inviteCode?: string;
}

export const GroupPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useSettings();
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
                setError(t('neigh_details_error_fetch'));
            }
        } catch (err) {
            setError(t('common_connection_error'));
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

    const handleLeave = async () => {
        if (!neighborhoodId || !window.confirm(t('neigh_leave_confirm'))) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/neighborhoods/${neighborhoodId}/leave`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                navigate('/groupslist');
            } else {
                const data = await response.json();
                alert(data.message || t('neigh_leave_error'));
            }
        } catch (err) {
            console.error('Error leaving neighborhood:', err);
            alert(t('common_connection_error'));
        }
    };

    const [showManagement, setShowManagement] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const handleChangePassword = async () => {
        if (!newPassword) {
            alert(t('neigh_password_prompt'));
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/neighborhoods/${neighborhoodId}/password`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newPassword })
            });

            if (response.ok) {
                alert(t('neigh_password_success'));
                setNewPassword('');
            } else {
                const data = await response.json();
                alert(data.message || t('neigh_password_error'));
            }
        } catch (err) {
            console.error('Error changing password:', err);
            alert(t('common_connection_error'));
        }
    };

    const handleDelete = async () => {
        if (!neighborhoodId || !window.confirm(t('neigh_delete_confirm'))) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/neighborhoods/${neighborhoodId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                navigate('/groupslist');
            } else {
                const data = await response.json();
                alert(data.message || t('neigh_delete_error'));
            }
        } catch (err) {
            console.error('Error deleting neighborhood:', err);
            alert(t('common_connection_error'));
        }
    };

    if (!user) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="home-container">
                <p>{t('common_loading')}</p>
            </div>
        );
    }

    if (error || !neighborhood) {
        return (
            <div className="home-container">
                <p className="error-message">{error || t('neigh_not_found')}</p>
                <button onClick={() => navigate('/groupslist')}>{t('back_to_list')}</button>
            </div>
        );
    }

    const isAdmin = neighborhood.adminId === user.id;

    const handleRemoveMember = async (memberId: string) => {
        if (!window.confirm(t('neigh_remove_member_confirm'))) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/neighborhoods/${neighborhoodId}/members/${memberId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Refresh list
                fetchNeighborhoodDetails();
            } else {
                const data = await response.json();
                alert(data.message || t('neigh_remove_member_error'));
            }
        } catch (err) {
            console.error('Error removing member:', err);
            alert(t('common_connection_error'));
        }
    };

    return (
        <div className="home-container">
            <h2>{neighborhood.name}</h2>

            <div className="group-info-section">
                <h3>{t('neigh_info_section')}</h3>
                <p><strong>{t('neigh_city')}:</strong> {neighborhood.city}</p>
                <p><strong>{t('neigh_status')}:</strong> {neighborhood.isPrivate ? t('neigh_status_private') : t('neigh_status_public')}</p>
                <p><strong>{t('neigh_created_at')}:</strong> {new Date(neighborhood.createdAt).toLocaleDateString(t('appearance_language') === 'Język' ? 'pl-PL' : 'en-US')}</p>
                <p><strong>{t('neigh_members_count')}:</strong> {neighborhood.members?.length || 0}</p>
                {isAdmin && <p className="admin-badge">{t('neigh_admin_badge')}</p>}
            </div>

            {isAdmin && showManagement && (
                <div style={{
                    backgroundColor: '#fff3e0',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #ffcc80'
                }}>
                    <h3>{t('neigh_mgmt_title')}</h3>
                    <p>{t('neigh_mgmt_desc')}</p>

                    {neighborhood.isPrivate && neighborhood.inviteCode && (
                        <div style={{ margin: '15px 0', padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px dashed #ccc' }}>
                            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{t('neigh_invite_code')}:</p>
                            <code style={{ fontSize: '1.2em', color: '#d32f2f' }}>{neighborhood.inviteCode}</code>
                            <p style={{ fontSize: '0.8em', color: '#666', margin: '5px 0 0 0' }}>{t('neigh_invite_desc')}</p>
                        </div>
                    )}

                    {neighborhood.isPrivate && (
                        <div style={{ margin: '15px 0', padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{t('neigh_change_password')}:</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="password"
                                    placeholder="Nowe hasło"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                                <button
                                    onClick={handleChangePassword}
                                    style={{
                                        backgroundColor: '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        padding: '5px 10px'
                                    }}
                                >
                                    {t('common_save')}
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleDelete}
                        style={{
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        {t('neigh_delete_btn')}
                    </button>
                </div>
            )}

            <div className="members-section">
                <h3>{t('neigh_members_section')} ({neighborhood.members?.length || 0})</h3>
                {neighborhood.members && neighborhood.members.length > 0 ? (
                    <ul className="members-list">
                        {neighborhood.members.map((member) => (
                            <li key={member.id} className="member-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{member.firstName} {member.lastName}</strong>
                                    {member.id === neighborhood.adminId && <span className="member-admin-badge">{t('neigh_role_admin')}</span>}
                                    {member.id === user.id && <span className="member-you-badge">{t('neigh_role_you')}</span>}
                                </div>
                                {isAdmin && member.id !== user.id && (
                                    <button
                                        onClick={() => handleRemoveMember(member.id)}
                                        style={{
                                            backgroundColor: '#ffebee',
                                            color: '#c62828',
                                            border: 'none',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9em'
                                        }}
                                    >
                                        {t('neigh_remove_member_btn') || 'Usuń'}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>{t('neigh_no_members')}</p>
                )}
            </div>

            {/* Announcements Section */}
            {neighborhoodId && (
                <AnnouncementsSection
                    neighborhoodId={neighborhoodId}
                    userId={user.id}
                    isAdmin={isAdmin}
                />
            )}

            <div className="chat-section">
                <h3>{t('neigh_chat_title')}</h3>
                <div className="chat-container">
                    {conversationId ? (
                        <Chat conversationId={conversationId} userId={user.id} />
                    ) : (
                        <p className="loading-message">
                            {t('neigh_chat_loading')}
                        </p>
                    )}
                </div>
            </div>

            <div className="navigation-buttons">
                <button onClick={() => navigate('/groupslist')}>
                    {t('back_to_list')}
                </button>
                <button onClick={() => navigate('/home')}>
                    {t('back_home')}
                </button>
                {!isAdmin && (
                    <button
                        onClick={handleLeave}
                        style={{ backgroundColor: '#f44336' }}
                    >
                        {t('neigh_leave_btn')}
                    </button>
                )}
                {isAdmin && (
                    <button
                        className="delete-button"
                        onClick={() => setShowManagement(!showManagement)}
                    >
                        {showManagement ? t('neigh_mgmt_hide') : t('neigh_mgmt_show')}
                    </button>
                )}
            </div>
        </div>
    );
};