
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { UserProfileModal } from '../components/UserProfileModal';
import '../styles/AdminPage.css';

type AdminSection = 'dashboard' | 'users' | 'announcements' | 'ratings' | 'neighborhoods' | 'logs' | 'system-announcements' | 'conversations' | 'export';

interface Stats {
    totalUsers: number;
    totalAnnouncements: number;
    totalRatings: number;
    totalNeighborhoods: number;
}

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
    isActive: boolean;
}

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: string;
    status: string;
    createdAt: string;
    author: { id: string; firstName: string; lastName: string };
    authorId?: string;
    neighborhood: { name: string };
}

interface Rating {
    id: string;
    stars: number;
    comment: string;
    createdAt: string;
    fromUser: { id: string; firstName: string; lastName: string };
    fromUserId?: string;
    toUser: { id: string; firstName: string; lastName: string };
    toUserId?: string;
}

interface Neighborhood {
    id: string;
    name: string;
    city: string;
    isPrivate: boolean;
    adminId: string;
    admin: { id: string; firstName: string; lastName: string };
    members: { id: string; firstName: string; lastName: string }[];
}

export const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t } = useSettings();
    const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [expandedNeighborhood, setExpandedNeighborhood] = useState<string | null>(null);
    const [editModal, setEditModal] = useState<{ type: 'announcement' | 'rating' | 'neighborhood' | 'user'; item: any } | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editStatus, setEditStatus] = useState('');

    // User edit state
    const [editUserFirstName, setEditUserFirstName] = useState('');
    const [editUserLastName, setEditUserLastName] = useState('');
    const [editUserEmail, setEditUserEmail] = useState('');
    const [editUserAddress, setEditUserAddress] = useState('');
    const [editUserAttributes, setEditUserAttributes] = useState<string[]>([]);


    // Neighborhood edit state
    const [editNeighborhoodName, setEditNeighborhoodName] = useState('');
    const [editNeighborhoodCity, setEditNeighborhoodCity] = useState('');


    // New extended admin state
    const [logs, setLogs] = useState<any[]>([]);
    const [systemAnnouncements, setSystemAnnouncements] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);

    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [conversationMessages, setConversationMessages] = useState<any[]>([]);
    const [showSystemAnnouncementModal, setShowSystemAnnouncementModal] = useState(false);
    const [newSystemAnnouncement, setNewSystemAnnouncement] = useState({ title: '', content: '', priority: 'medium' });

    // Profile modal state
    const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);

    const itemsPerPage = 10;

    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')} `,
        'Content-Type': 'application/json'
    });

    const loadSectionData = async () => {
        setIsLoading(true);
        try {
            switch (activeSection) {
                case 'dashboard':
                    await loadStats();
                    break;
                case 'users':
                    await loadUsers();
                    break;
                case 'announcements':
                    await loadAnnouncements();
                    break;
                case 'ratings':
                    await loadRatings();
                    break;
                case 'neighborhoods':
                    await loadNeighborhoods();
                    break;
                case 'logs':
                    await loadLogs();
                    break;
                case 'system-announcements':
                    await loadSystemAnnouncements();
                    break;
                case 'conversations':
                    await loadConversations();
                    break;
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/home');
            return;
        }
        loadSectionData();
    }, [activeSection, currentPage, searchQuery, loadSectionData, navigate, user?.role]);

    const loadStats = async () => {
        const response = await fetch('http://localhost:3001/api/admin/stats', {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            const data = await response.json();
            setStats(data.data);
        }
    };

    const loadUsers = async () => {
        const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: itemsPerPage.toString(),
            ...(searchQuery && { search: searchQuery })
        });
        const response = await fetch(`http://localhost:3001/api/admin/users?${params}`, {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            const data = await response.json();
            setUsers(data.data.users);
            setTotalItems(data.data.total);
        }
    };

    const loadAnnouncements = async () => {
        const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: itemsPerPage.toString()
        });
        const response = await fetch(`http://localhost:3001/api/admin/announcements?${params}`, {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            const data = await response.json();
            setAnnouncements(data.data.announcements);
            setTotalItems(data.data.total);
        }
    };

    const loadRatings = async () => {
        const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: itemsPerPage.toString()
        });
        const response = await fetch(`http://localhost:3001/api/admin/ratings?${params}`, {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            const data = await response.json();
            setRatings(data.data.ratings);
            setTotalItems(data.data.total);
        }
    };

    const loadNeighborhoods = async () => {
        const response = await fetch('http://localhost:3001/api/admin/neighborhoods', {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            const data = await response.json();
            setNeighborhoods(data.data);
        }
    };

    const loadLogs = async () => {
        const response = await fetch('http://localhost:3001/api/admin/logs', {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            const data = await response.json();
            setLogs(data.data.logs || []);
        }
    };

    const loadSystemAnnouncements = async () => {
        const response = await fetch('http://localhost:3001/api/admin/system-announcements', {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            const data = await response.json();
            setSystemAnnouncements(data.data.announcements || []);
        }
    };

    const loadConversations = async () => {
        const response = await fetch('http://localhost:3001/api/admin/conversations', {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            const data = await response.json();
            setConversations(data.data || []);
        }
    };



    const loadConversationMessages = async (conversationId: string) => {
        const response = await fetch(`http://localhost:3001/api/admin/conversations/${conversationId}/messages`, {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            const data = await response.json();
            setConversationMessages(data.data.messages || []);
        }
    };

    const handleCreateSystemAnnouncement = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/admin/system-announcements', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(newSystemAnnouncement)
            });
            if (response.ok) {
                setShowSystemAnnouncementModal(false);
                setNewSystemAnnouncement({ title: '', content: '', priority: 'medium' });
                await loadSystemAnnouncements();
            } else {
                const data = await response.json();
                alert(data.message || 'Błąd podczas tworzenia ogłoszenia');
            }
        } catch (error) {
            console.error('Error creating system announcement:', error);
            alert('Wystąpił błąd połączenia');
        }
    };

    const handleDeleteSystemAnnouncement = async (id: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć to ogłoszenie systemowe?')) return;
        const response = await fetch(`http://localhost:3001/api/admin/system-announcements/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.ok) {
            loadSystemAnnouncements();
        }
    };

    const handleDeleteMessage = async (id: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę wiadomość?')) return;
        const response = await fetch(`http://localhost:3001/api/admin/messages/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.ok && selectedConversation) {
            loadConversationMessages(selectedConversation);
        }
    };





    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Wystąpił błąd podczas eksportu danych.');
        }
    };

    const handleExportUsers = () => {
        handleDownload('http://localhost:3001/api/admin/export/users', 'users_export.csv');
    };

    const handleExportStats = () => {
        handleDownload('http://localhost:3001/api/admin/export/stats', 'stats_export.json');
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        if (!window.confirm(`Czy na pewno chcesz zmienić rolę użytkownika na "${newRole}"?`)) return;

        const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ role: newRole })
        });
        if (response.ok) {
            loadUsers();
        }
    };

    const handleUpdateUser = async (userId: string, data: { firstName?: string; lastName?: string; email?: string; address?: string; attributes?: string[] }) => {
        const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (response.ok) {
            setEditModal(null);
            loadUsers();
        } else {
            const error = await response.json();
            alert(error.message || 'Nie udało się zaktualizować użytkownika');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tego użytkownika? Ta operacja jest nieodwracalna.')) return;

        const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.ok) {
            loadUsers();
        }
    };

    const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
        const action = currentStatus ? 'zablokować' : 'odblokować';
        if (!window.confirm(`Czy na pewno chcesz ${action} tego użytkownika?`)) return;

        const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ isActive: !currentStatus })
        });
        if (response.ok) {
            loadUsers();
        }
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) return;

        const response = await fetch(`http://localhost:3001/api/admin/announcements/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.ok) {
            loadAnnouncements();
        }
    };

    const handleUpdateAnnouncement = async (id: string, data: any) => {
        const response = await fetch(`http://localhost:3001/api/admin/announcements/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (response.ok) {
            setEditModal(null);
            loadAnnouncements();
        }
    };

    const handleDeleteRating = async (id: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę ocenę?')) return;

        const response = await fetch(`http://localhost:3001/api/admin/ratings/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.ok) {
            loadRatings();
        }
    };

    const handleRemoveMember = async (neighborhoodId: string, memberId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tego użytkownika z osiedla?')) return;

        const response = await fetch(`http://localhost:3001/api/admin/neighborhoods/${neighborhoodId}/member/${memberId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.ok) {
            loadNeighborhoods();
        }
    };

    const handleDeleteNeighborhood = async (id: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć to osiedle? Usunięte zostaną również konwersacje.')) return;

        const response = await fetch(`http://localhost:3001/api/admin/neighborhoods/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.ok) {
            loadNeighborhoods();
        }
    };

    const handleUpdateNeighborhood = async (id: string, data: any) => {
        const response = await fetch(`http://localhost:3001/api/admin/neighborhoods/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (response.ok) {
            setEditModal(null);
            loadNeighborhoods();
        }
    };

    const handleSectionChange = (section: AdminSection) => {
        setActiveSection(section);
        setCurrentPage(1);
        setSearchQuery('');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const renderDashboard = () => (
        <>
            <div className="admin-header">
                <h1>🎛️ {t('admin_dashboard_title')}</h1>

            </div>
            <div className="admin-stats-grid">
                <div className="admin-stat-card users">
                    <div className="admin-stat-icon">👥</div>
                    <div className="admin-stat-info">
                        <h3>{stats?.totalUsers || 0}</h3>
                        <p>{t('admin_dashboard_users')}</p>
                    </div>
                </div>
                <div className="admin-stat-card announcements">
                    <div className="admin-stat-icon">📢</div>
                    <div className="admin-stat-info">
                        <h3>{stats?.totalAnnouncements || 0}</h3>
                        <p>{t('admin_dashboard_announcements')}</p>
                    </div>
                </div>
                <div className="admin-stat-card ratings">
                    <div className="admin-stat-icon">⭐</div>
                    <div className="admin-stat-info">
                        <h3>{stats?.totalRatings || 0}</h3>
                        <p>{t('admin_dashboard_ratings')}</p>
                    </div>
                </div>
                <div className="admin-stat-card neighborhoods">
                    <div className="admin-stat-icon">🏘️</div>
                    <div className="admin-stat-info">
                        <h3>{stats?.totalNeighborhoods || 0}</h3>
                        <p>{t('admin_dashboard_neighborhoods')}</p>
                    </div>
                </div>
            </div>
        </>
    );

    const renderUsers = () => (
        <div className="admin-table-container">
            <div className="admin-table-header">
                <h2>{t('admin_users_header')}</h2>
                <input
                    type="text"
                    className="admin-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            {isLoading ? (
                <div className="admin-loading">{t('admin_users_loading')}</div>
            ) : users.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">👥</div>
                    <p>{t('admin_users_empty')}</p>
                </div>
            ) : (
                <>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t('admin_users_th_email')}</th>
                                <th>{t('admin_users_th_first_name')} {t('admin_users_th_last_name')}</th>
                                <th>{t('admin_users_th_role')}</th>
                                <th>{t('admin_users_th_status')}</th>
                                <th>{t('admin_users_th_registration_date')}</th>
                                <th>{t('admin_users_th_actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.email}</td>
                                    <td><span className="admin-user-link" onClick={() => setProfileModalUserId(u.id)} style={{ cursor: 'pointer', textDecoration: 'underline', color: '#4fc3f7' }}>{u.firstName} {u.lastName}</span></td>
                                    <td>
                                        <span className={`admin-badge admin-badge-${u.role}`}>
                                            {u.role === 'admin' ? t('admin_users_role_admin') : t('admin_users_role_user')}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`admin-badge ${u.isActive ? 'admin-badge-active' : 'admin-badge-blocked'}`} style={{ backgroundColor: u.isActive ? '#4caf50' : '#f44336', color: 'white' }}>
                                            {u.isActive ? t('admin_users_status_active') : t('admin_users_status_blocked')}
                                        </span>
                                    </td>
                                    <td>{new Date(u.createdAt).toLocaleDateString('pl-PL')}</td>
                                    <td className="admin-table-actions">
                                        <div className="admin-actions-wrapper">
                                            {u.id !== user?.id && (
                                                <>
                                                    <button
                                                        className="admin-btn admin-btn-primary admin-btn-small"
                                                        onClick={() => navigate(`/direct-messages?userId=${u.id}`)}
                                                        title={t('admin_users_actions_chat_title')}
                                                    >
                                                        💬
                                                    </button>
                                                    <button
                                                        className="admin-btn admin-btn-primary admin-btn-small"
                                                        onClick={() => {
                                                            setEditUserFirstName(u.firstName || '');
                                                            setEditUserLastName(u.lastName || '');
                                                            setEditUserEmail(u.email || '');
                                                            setEditUserAddress((u as any).address || '');
                                                            setEditUserAttributes((u as any).attributes || []);
                                                            setEditModal({ type: 'user', item: u });
                                                        }}
                                                        title={t('admin_users_actions_edit_profile_title')}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="admin-btn admin-btn-secondary admin-btn-small"
                                                        onClick={() => handleChangeRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                                                    >
                                                        {u.role === 'admin' ? t('admin_users_actions_remove_admin') : t('admin_users_actions_make_admin')}
                                                    </button>
                                                    <button
                                                        className="admin-btn admin-btn-danger admin-btn-small"
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        title={t('admin_users_actions_delete_title')}
                                                    >
                                                        🗑️
                                                    </button>
                                                    <button
                                                        className={`admin-btn admin-btn-small ${u.isActive ? 'admin-btn-warning' : 'admin-btn-success'}`}
                                                        onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                                                        title={u.isActive ? t('admin_users_actions_block_title') : t('admin_users_actions_unblock_title')}
                                                        style={{ marginLeft: '5px' }}
                                                    >
                                                        {u.isActive ? '🚫' : '✅'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <div className="admin-pagination">
                            <button
                                className="admin-pagination-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                ← {t('admin_pagination_previous')}
                            </button>
                            <span className="admin-pagination-info">
                                {t('admin_pagination_page')} {currentPage} {t('admin_pagination_of')} {totalPages}
                            </span>
                            <button
                                className="admin-pagination-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                {t('admin_pagination_next')} →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    const renderAnnouncements = () => (
        <div className="admin-table-container">
            <div className="admin-table-header">
                <h2>{t('admin_announcements_header')}</h2>
            </div>
            <div className="admin-search-bar">
                <input
                    type="text"
                    placeholder={t('admin_announcements_search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            {isLoading ? (
                <div className="admin-loading">{t('common_loading')}</div>
            ) : announcements.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">📢</div>
                    <p>{t('admin_announcements_empty')}</p>
                </div>
            ) : (
                <>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t('admin_announcements_th_title')}</th>
                                <th>{t('admin_announcements_th_author')}</th>
                                <th>{t('admin_announcements_th_neighborhood')}</th>
                                <th>{t('admin_announcements_th_type')}</th>
                                <th>{t('admin_announcements_th_status')}</th>
                                <th>{t('admin_announcements_th_date')}</th>
                                <th>{t('admin_announcements_th_actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {announcements.map(a => (
                                <tr key={a.id}>
                                    <td>{a.title}</td>
                                    <td>{a.author && <span className="admin-user-link" onClick={() => setProfileModalUserId(a.author.id || (a as any).authorId)} style={{ cursor: 'pointer', textDecoration: 'underline', color: '#4fc3f7' }}>{a.author.firstName} {a.author.lastName}</span>}</td>
                                    <td>{a.neighborhood?.name}</td>
                                    <td>
                                        <span className={`admin-badge admin-badge-${a.type.toLowerCase().replace('_', '-')}`}>
                                            {a.type}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`admin-badge admin-badge-${a.status.toLowerCase().replace('_', '-')}`}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td>{new Date(a.createdAt).toLocaleDateString('pl-PL')}</td>
                                    <td className="admin-table-actions">
                                        <div className="admin-actions-wrapper">
                                            <button
                                                className="admin-btn admin-btn-primary admin-btn-small"
                                                onClick={() => {
                                                    setEditTitle(a.title);
                                                    setEditContent(a.content);
                                                    setEditStatus(a.status);
                                                    setEditModal({ type: 'announcement', item: a });
                                                }}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="admin-btn admin-btn-danger admin-btn-small"
                                                onClick={() => handleDeleteAnnouncement(a.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <div className="admin-pagination">
                            <button
                                className="admin-pagination-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                ← {t('admin_pagination_previous')}
                            </button>
                            <span className="admin-pagination-info">
                                {t('admin_pagination_page')} {currentPage} {t('admin_pagination_of')} {totalPages}
                            </span>
                            <button
                                className="admin-pagination-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                {t('admin_pagination_next')} →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    const renderRatings = () => (
        <div className="admin-table-container">
            <div className="admin-table-header">
                <h2>{t('admin_ratings_header')}</h2>
            </div>
            <div className="admin-search-bar">
                <input
                    type="text"
                    placeholder={t('admin_ratings_search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            {isLoading ? (
                <div className="admin-loading">{t('admin_ratings_loading')}</div>
            ) : ratings.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">⭐</div>
                    <p>{t('admin_ratings_empty')}</p>
                </div>
            ) : (
                <>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t('admin_ratings_th_rating')}</th>
                                <th>{t('admin_ratings_th_comment')}</th>
                                <th>{t('admin_ratings_th_rater')}</th>
                                <th>{t('admin_ratings_th_rated')}</th>
                                <th>{t('admin_logs_th_date')}</th>
                                <th>{t('admin_users_th_actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ratings.map(r => (
                                <tr key={r.id}>
                                    <td>
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < Number(r.stars) ? 'admin-star' : 'admin-star-empty'}>
                                                {i < Number(r.stars) ? '★' : '☆'}
                                            </span>
                                        ))}
                                    </td>
                                    <td className="admin-rating-comment">
                                        {r.comment || '-'}
                                    </td>
                                    <td>{r.fromUser && <span className="admin-user-link" onClick={() => setProfileModalUserId((r as any).fromUserId || r.fromUser?.id)} style={{ cursor: 'pointer', textDecoration: 'underline', color: '#4fc3f7' }}>{r.fromUser.firstName} {r.fromUser.lastName}</span>}</td>
                                    <td>{r.toUser && <span className="admin-user-link" onClick={() => setProfileModalUserId((r as any).toUserId || r.toUser?.id)} style={{ cursor: 'pointer', textDecoration: 'underline', color: '#4fc3f7' }}>{r.toUser.firstName} {r.toUser.lastName}</span>}</td>
                                    <td>{new Date(r.createdAt).toLocaleDateString('pl-PL')}</td>
                                    <td className="admin-table-actions">
                                        <div className="admin-actions-wrapper">
                                            <button
                                                className="admin-btn admin-btn-danger admin-btn-small"
                                                onClick={() => handleDeleteRating(r.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <div className="admin-pagination">
                            <button
                                className="admin-pagination-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                ← {t('admin_pagination_previous')}
                            </button>
                            <span className="admin-pagination-info">
                                {t('admin_pagination_page')} {currentPage} {t('admin_pagination_of')} {totalPages}
                            </span>
                            <button
                                className="admin-pagination-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                {t('admin_pagination_next')} →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    const renderNeighborhoods = () => (
        <div className="admin-table-container">
            <div className="admin-table-header">
                <h2>{t('admin_neighborhoods_header')}</h2>
            </div>
            <div className="admin-search-bar">
                <input
                    type="text"
                    placeholder={t('admin_neighborhoods_search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            {isLoading ? (
                <div className="loading-spinner">{t('common_loading')}</div>
            ) : (
                <>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}></th>
                                <th>{t('admin_neighborhoods_th_name')}</th>
                                <th>{t('admin_neighborhoods_th_city')}</th>
                                <th>{t('admin_neighborhoods_th_admin')}</th>
                                <th>{t('admin_neighborhoods_th_members')}</th>
                                <th className="admin-table-actions">{t('admin_users_th_actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {neighborhoods.map(n => (
                                <React.Fragment key={n.id}>
                                    <tr>
                                        <td>
                                            <button
                                                className="admin-btn admin-btn-secondary admin-btn-small"
                                                onClick={() => setExpandedNeighborhood(expandedNeighborhood === n.id ? null : n.id)}
                                            >
                                                {expandedNeighborhood === n.id ? '▼' : '▶'}
                                            </button>
                                        </td>
                                        <td>{n.name}</td>
                                        <td>{n.city}</td>
                                        <td>{n.admin && <span className="admin-user-link" onClick={() => setProfileModalUserId(n.adminId)} style={{ cursor: 'pointer', textDecoration: 'underline', color: '#4fc3f7' }}>{n.admin.firstName} {n.admin.lastName}</span>}</td>
                                        <td>{n.members?.length || 0}</td>
                                        <td className="admin-table-actions">
                                            <div className="admin-actions-wrapper">
                                                <button
                                                    className="admin-btn admin-btn-primary admin-btn-small"
                                                    onClick={() => {
                                                        setEditNeighborhoodName(n.name);
                                                        setEditNeighborhoodCity(n.city);

                                                        setEditModal({ type: 'neighborhood' as any, item: n });
                                                    }}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="admin-btn admin-btn-danger admin-btn-small"
                                                    onClick={() => handleDeleteNeighborhood(n.id)}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedNeighborhood === n.id && (
                                        <tr className="admin-expandable-row">
                                            <td colSpan={6}>
                                                <div className="admin-expandable-content">
                                                    <strong>{t('admin_neighborhoods_members')}:</strong>
                                                    <div className="admin-members-list">
                                                        {n.members?.map(m => (
                                                            <div key={m.id} className="admin-member-chip">
                                                                <span className="admin-user-link" onClick={(e) => { e.stopPropagation(); setProfileModalUserId(m.id); }} style={{ cursor: 'pointer', textDecoration: 'underline', color: '#4fc3f7' }}>{m.firstName} {m.lastName}</span>
                                                                {m.id !== n.adminId && (
                                                                    <button onClick={() => handleRemoveMember(n.id, m.id)}>
                                                                        ×
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );

    const renderLogs = () => (
        <div className="admin-table-container">
            <div className="admin-table-header">
                <h2>{t('admin_logs_header')}</h2>
            </div>
            {isLoading ? (
                <div className="loading-spinner">{t('common_loading')}</div>
            ) : (
                <>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t('admin_logs_th_date')}</th>
                                <th>{t('admin_logs_th_admin')}</th>
                                <th>{t('admin_logs_th_action')}</th>
                                <th>{t('admin_logs_th_target')}</th>
                                <th>{t('admin_logs_th_details')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log: any) => (
                                <tr key={log.id}>
                                    <td>{new Date(log.createdAt).toLocaleString('pl-PL')}</td>
                                    <td><span className="admin-badge">{log.action}</span></td>
                                    <td>{log.admin && <span className="admin-user-link" onClick={() => setProfileModalUserId(log.adminId || log.admin?.id)} style={{ cursor: 'pointer', textDecoration: 'underline', color: '#4fc3f7' }}>{log.admin.firstName} {log.admin.lastName}</span>}</td>
                                    <td>{log.targetType}</td>
                                    <td>{JSON.stringify(log.details || {})}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );

    const renderSystemAnnouncements = () => (
        <div className="admin-table-container">
            <div className="admin-table-header">
                <h2>{t('admin_sys_ann_header')}</h2>
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => setShowSystemAnnouncementModal(true)}
                >
                    {t('admin_sys_ann_add_btn')}
                </button>
            </div>
            {isLoading ? (
                <div className="loading-spinner">{t('common_loading')}</div>
            ) : (
                <>
                    {showSystemAnnouncementModal && (
                        <div className="admin-modal-overlay">
                            <div className="admin-modal">
                                <h3>{t('admin_sys_ann_add_btn')}</h3>
                                <div className="admin-form-group">
                                    <label>{t('admin_sys_ann_th_title')}</label>
                                    <input
                                        type="text"
                                        className="admin-form-input"
                                        value={newSystemAnnouncement.title}
                                        onChange={e => setNewSystemAnnouncement({ ...newSystemAnnouncement, title: e.target.value })}
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>{t('admin_sys_ann_th_content')}</label>
                                    <textarea
                                        className="admin-form-textarea"
                                        value={newSystemAnnouncement.content}
                                        onChange={e => setNewSystemAnnouncement({ ...newSystemAnnouncement, content: e.target.value })}
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>{t('admin_sys_ann_th_priority')}</label>
                                    <select
                                        className="admin-form-select"
                                        value={newSystemAnnouncement.priority}
                                        onChange={e => setNewSystemAnnouncement({ ...newSystemAnnouncement, priority: e.target.value })}
                                    >
                                        <option value="low">{t('admin_sys_ann_priority_low')}</option>
                                        <option value="medium">{t('admin_sys_ann_priority_medium')}</option>
                                        <option value="high">{t('admin_sys_ann_priority_high')}</option>
                                        <option value="critical">{t('admin_sys_ann_priority_critical')}</option>
                                    </select>
                                </div>
                                <div className="admin-modal-actions">
                                    <button
                                        className="admin-btn admin-btn-secondary"
                                        onClick={() => setShowSystemAnnouncementModal(false)}
                                    >
                                        {t('common_cancel')}
                                    </button>
                                    <button
                                        className="admin-btn admin-btn-primary"
                                        onClick={handleCreateSystemAnnouncement}
                                    >
                                        {t('create_neigh_submit')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t('admin_sys_ann_th_title')}</th>
                                <th>{t('admin_sys_ann_th_content')}</th>
                                <th>{t('admin_sys_ann_th_priority')}</th>
                                <th>{t('admin_sys_ann_th_active')}</th>
                                <th>{t('admin_logs_th_date')}</th>
                                <th>{t('admin_users_th_actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {systemAnnouncements.map((sa: any) => (
                                <tr key={sa.id}>
                                    <td>{sa.title}</td>
                                    <td>{sa.content.substring(0, 50)}...</td>
                                    <td><span className={`admin-badge admin-badge-${sa.priority}`}>{t(`admin_sys_ann_priority_${sa.priority}`)}</span></td>
                                    <td>{sa.isActive ? `✅ ${t('admin_sys_ann_th_active')}` : '❌'}</td>
                                    <td>{new Date(sa.createdAt).toLocaleDateString('pl-PL')}</td>
                                    <td>
                                        <button
                                            className="admin-btn admin-btn-danger admin-btn-small"
                                            onClick={() => handleDeleteSystemAnnouncement(sa.id)}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );

    const renderConversations = () => (
        <div className="admin-table-container">
            <div className="admin-table-header">
                <h2>{t('admin_conversations_header')}</h2>
            </div>

            <div className="admin-conversations-layout">
                <div className="admin-conversations-list">
                    <h3>{t('admin_conversations_group_title')}</h3>
                    {conversations.length === 0 ? (
                        <p className="admin-empty">{t('admin_conversations_empty')}</p>
                    ) : (
                        <ul className="admin-conversation-items">
                            {conversations.map((conv: any) => (
                                <li
                                    key={conv.id}
                                    className={`admin-conversation-item ${selectedConversation === conv.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedConversation(conv.id);
                                        loadConversationMessages(conv.id);
                                    }}
                                >
                                    <strong>{conv.name || t('admin_conversations_group_title')}</strong>
                                    <span>{conv.participants?.length || 0} {t('admin_conversations_participants')}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="admin-messages-panel">
                    {selectedConversation ? (
                        <>
                            <h3>{t('admin_conversations_messages_title')}</h3>
                            {conversationMessages.length === 0 ? (
                                <p className="admin-empty">{t('admin_conversations_messages_empty')}</p>
                            ) : (
                                <div className="admin-messages-list">
                                    {conversationMessages.map((msg: any) => (
                                        <div key={msg.id} className="admin-message-item">
                                            <div className="admin-message-header">
                                                <span className="admin-user-link" onClick={() => setProfileModalUserId(msg.senderId || msg.sender?.id)} style={{ cursor: 'pointer', textDecoration: 'underline', color: '#4fc3f7' }}><strong>{msg.sender?.firstName} {msg.sender?.lastName}</strong></span>
                                                <span>{new Date(msg.createdAt).toLocaleString('pl-PL')}</span>
                                            </div>
                                            <p>{msg.content}</p>
                                            <button
                                                className="admin-btn admin-btn-danger admin-btn-small"
                                                onClick={() => handleDeleteMessage(msg.id)}
                                            >
                                                {t('admin_users_actions_delete')}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="admin-empty">{t('admin_conversations_select_prompt')}</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderExport = () => (
        <div className="admin-table-container">
            <div className="admin-table-header">
                <h2>{t('admin_export_header')}</h2>
            </div>

            <div className="admin-export-options" style={{ padding: '20px' }}>
                <div className="admin-export-card">
                    <h3>{t('admin_export_users_title')}</h3>
                    <p>{t('admin_export_users_desc')}</p>
                    <button className="admin-btn admin-btn-primary" onClick={handleExportUsers}>
                        {t('admin_export_users_btn_label')}
                    </button>
                </div>

                <div className="admin-export-card">
                    <h3>{t('admin_export_stats_title')}</h3>
                    <p>{t('admin_export_stats_desc')}</p>
                    <button className="admin-btn admin-btn-primary" onClick={handleExportStats}>
                        {t('admin_export_stats_btn_label')}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderEditModal = () => {
        if (!editModal) return null;

        if (editModal.type === 'announcement') {
            return (
                <div className="admin-modal-overlay" onClick={() => setEditModal(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h3>{t('admin_edit_announcement_title')}</h3>
                        <div className="admin-form-group">
                            <label>{t('admin_announcements_th_title')}</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label>{t('admin_sys_ann_th_content')}</label>
                            <textarea
                                className="admin-form-textarea"
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label>{t('admin_announcements_th_status')}</label>
                            <select
                                className="admin-form-select"
                                value={editStatus}
                                onChange={e => setEditStatus(e.target.value)}
                            >
                                <option value="ACTIVE">{t('admin_announcement_status_active')}</option>
                                <option value="IN_PROGRESS">{t('admin_announcement_status_in_progress')}</option>
                                <option value="COMPLETED">{t('admin_announcement_status_completed')}</option>
                            </select>
                        </div>
                        <div className="admin-modal-actions">
                            <button className="admin-btn admin-btn-secondary" onClick={() => setEditModal(null)}>
                                {t('common_cancel')}
                            </button>
                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={() => handleUpdateAnnouncement(editModal.item.id, { title: editTitle, content: editContent, status: editStatus })}
                            >
                                {t('common_save')}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (editModal.type === 'neighborhood') {
            return (
                <div className="admin-modal-overlay" onClick={() => setEditModal(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h3>{t('admin_edit_neighborhood_title')}</h3>
                        <div className="admin-form-group">
                            <label>{t('admin_neighborhoods_th_name')}</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={editNeighborhoodName}
                                onChange={e => setEditNeighborhoodName(e.target.value)}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label>{t('admin_neighborhoods_th_city')}</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={editNeighborhoodCity}
                                onChange={e => setEditNeighborhoodCity(e.target.value)}
                            />
                        </div>
                        <div className="admin-modal-actions">
                            <button className="admin-btn admin-btn-secondary" onClick={() => setEditModal(null)}>
                                {t('common_cancel')}
                            </button>
                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={() => handleUpdateNeighborhood(editModal.item.id, {
                                    name: editNeighborhoodName,
                                    city: editNeighborhoodCity
                                })}
                            >
                                {t('common_save')}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (editModal.type === 'user') {
            return (
                <div className="admin-modal-overlay" onClick={() => setEditModal(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h3>{t('admin_edit_user_title')}</h3>
                        <div className="admin-form-group">
                            <label>{t('admin_users_th_first_name')}</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={editUserFirstName}
                                onChange={e => setEditUserFirstName(e.target.value)}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label>{t('admin_users_th_last_name')}</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={editUserLastName}
                                onChange={e => setEditUserLastName(e.target.value)}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label>{t('admin_users_th_email')}</label>
                            <input
                                type="email"
                                className="admin-form-input"
                                value={editUserEmail}
                                onChange={e => setEditUserEmail(e.target.value)}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label>{t('profile_address')}</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={editUserAddress}
                                onChange={e => setEditUserAddress(e.target.value)}
                            />
                        </div>
                        <div className="admin-modal-actions">
                            <button className="admin-btn admin-btn-secondary" onClick={() => setEditModal(null)}>
                                {t('common_cancel')}
                            </button>
                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={() => handleUpdateUser(editModal.item.id, {
                                    firstName: editUserFirstName,
                                    lastName: editUserLastName,
                                    email: editUserEmail,
                                    address: editUserAddress,
                                    attributes: editUserAttributes
                                })}
                            >
                                {t('common_save')}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    if (user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>🛡️ Admin</h2>
                </div>
                <nav className="admin-nav">
                    <button
                        className={`admin-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('dashboard')}
                    >
                        <span className="icon">🏠</span>
                        Dashboard
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'users' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('users')}
                    >
                        <span className="icon">👥</span>
                        {t('admin_nav_users')}
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'announcements' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('announcements')}
                    >
                        <span className="icon">📢</span>
                        {t('admin_nav_announcements')}
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'ratings' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('ratings')}
                    >
                        <span className="icon">⭐</span>
                        {t('admin_nav_ratings')}
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'neighborhoods' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('neighborhoods')}
                    >
                        <span className="icon">🏘️</span>
                        {t('admin_nav_neighborhoods')}
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'logs' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('logs')}
                    >
                        <span className="icon">📋</span>
                        {t('admin_nav_logs')}
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'system-announcements' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('system-announcements')}
                    >
                        <span className="icon">📣</span>
                        {t('admin_nav_system_announcements')}
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'conversations' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('conversations')}
                    >
                        <span className="icon">💬</span>
                        {t('admin_nav_conversations')}
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'export' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('export')}
                    >
                        <span className="icon">📥</span>
                        {t('admin_nav_export')}
                    </button>
                </nav>
                <div className="admin-sidebar-footer">
                    <button className="admin-nav-item" onClick={() => navigate('/settings')}>
                        <span className="icon">⚙️</span>
                        {t('admin_nav_settings')}
                    </button>
                    <button className="admin-nav-item" onClick={handleLogout} style={{ color: '#e94560' }}>
                        <span className="icon">🚪</span>
                        {t('admin_nav_logout')}
                    </button>
                </div>
            </aside>
            <main className="admin-main">
                {activeSection === 'dashboard' && renderDashboard()}
                {activeSection === 'users' && renderUsers()}
                {activeSection === 'announcements' && renderAnnouncements()}
                {activeSection === 'ratings' && renderRatings()}
                {activeSection === 'neighborhoods' && renderNeighborhoods()}
                {activeSection === 'logs' && renderLogs()}
                {activeSection === 'system-announcements' && renderSystemAnnouncements()}
                {activeSection === 'conversations' && renderConversations()}
                {activeSection === 'export' && renderExport()}
            </main>
            {renderEditModal()}
            {profileModalUserId && (
                <UserProfileModal
                    userId={profileModalUserId}
                    currentUserId={user?.id || ''}
                    onClose={() => setProfileModalUserId(null)}
                />
            )}
        </div>
    );
};
