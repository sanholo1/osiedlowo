import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import '../styles/AdminPage.css';

type AdminSection = 'dashboard' | 'users' | 'announcements' | 'ratings' | 'neighborhoods';

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
    author: { firstName: string; lastName: string };
    neighborhood: { name: string };
}

interface Rating {
    id: string;
    score: number;
    comment: string;
    createdAt: string;
    rater: { firstName: string; lastName: string };
    rated: { firstName: string; lastName: string };
}

interface Neighborhood {
    id: string;
    name: string;
    city: string;
    isPrivate: boolean;
    adminId: string;
    admin: { firstName: string; lastName: string };
    members: { id: string; firstName: string; lastName: string }[];
}

export const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
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
    const [editModal, setEditModal] = useState<{ type: 'announcement' | 'rating'; item: any } | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const itemsPerPage = 10;

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/home');
            return;
        }
        loadSectionData();
    }, [activeSection, currentPage, searchQuery]);

    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleSectionChange = (section: AdminSection) => {
        setActiveSection(section);
        setCurrentPage(1);
        setSearchQuery('');
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const renderDashboard = () => (
        <>
            <div className="admin-header">
                <h1>🎛️ Panel Administratora</h1>
                <p>Witaj, {user?.firstName}! Oto przegląd Twojego systemu.</p>
            </div>
            <div className="admin-stats-grid">
                <div className="admin-stat-card users">
                    <div className="admin-stat-icon">👥</div>
                    <div className="admin-stat-info">
                        <h3>{stats?.totalUsers || 0}</h3>
                        <p>Użytkownicy</p>
                    </div>
                </div>
                <div className="admin-stat-card announcements">
                    <div className="admin-stat-icon">📢</div>
                    <div className="admin-stat-info">
                        <h3>{stats?.totalAnnouncements || 0}</h3>
                        <p>Ogłoszenia</p>
                    </div>
                </div>
                <div className="admin-stat-card ratings">
                    <div className="admin-stat-icon">⭐</div>
                    <div className="admin-stat-info">
                        <h3>{stats?.totalRatings || 0}</h3>
                        <p>Oceny</p>
                    </div>
                </div>
                <div className="admin-stat-card neighborhoods">
                    <div className="admin-stat-icon">🏘️</div>
                    <div className="admin-stat-info">
                        <h3>{stats?.totalNeighborhoods || 0}</h3>
                        <p>Osiedla</p>
                    </div>
                </div>
            </div>
        </>
    );

    const renderUsers = () => (
        <div className="admin-table-container">
            <div className="admin-table-header">
                <h2>👥 Zarządzanie Użytkownikami</h2>
                <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Szukaj po nazwisku lub emailu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            {isLoading ? (
                <div className="admin-loading">Ładowanie...</div>
            ) : users.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">👥</div>
                    <p>Brak użytkowników do wyświetlenia</p>
                </div>
            ) : (
                <>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Imię i Nazwisko</th>
                                <th>Rola</th>
                                <th>Data rejestracji</th>
                                <th>Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.email}</td>
                                    <td>{u.firstName} {u.lastName}</td>
                                    <td>
                                        <span className={`admin-badge admin-badge-${u.role}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>{new Date(u.createdAt).toLocaleDateString('pl-PL')}</td>
                                    <td className="admin-table-actions">
                                        {u.id !== user?.id && (
                                            <>
                                                <button
                                                    className="admin-btn admin-btn-secondary admin-btn-small"
                                                    onClick={() => handleChangeRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                                                >
                                                    {u.role === 'admin' ? '👤 Usuń admina' : '👑 Nadaj admina'}
                                                </button>
                                                <button
                                                    className="admin-btn admin-btn-danger admin-btn-small"
                                                    onClick={() => handleDeleteUser(u.id)}
                                                >
                                                    🗑️
                                                </button>
                                            </>
                                        )}
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
                                ← Poprzednia
                            </button>
                            <span className="admin-pagination-info">
                                Strona {currentPage} z {totalPages}
                            </span>
                            <button
                                className="admin-pagination-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                Następna →
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
                <h2>📢 Zarządzanie Ogłoszeniami</h2>
            </div>
            {isLoading ? (
                <div className="admin-loading">Ładowanie...</div>
            ) : announcements.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">📢</div>
                    <p>Brak ogłoszeń do wyświetlenia</p>
                </div>
            ) : (
                <>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tytuł</th>
                                <th>Autor</th>
                                <th>Osiedle</th>
                                <th>Typ</th>
                                <th>Status</th>
                                <th>Data</th>
                                <th>Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {announcements.map(a => (
                                <tr key={a.id}>
                                    <td>{a.title}</td>
                                    <td>{a.author?.firstName} {a.author?.lastName}</td>
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
                                ← Poprzednia
                            </button>
                            <span className="admin-pagination-info">
                                Strona {currentPage} z {totalPages}
                            </span>
                            <button
                                className="admin-pagination-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                Następna →
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
                <h2>⭐ Zarządzanie Ocenami</h2>
            </div>
            {isLoading ? (
                <div className="admin-loading">Ładowanie...</div>
            ) : ratings.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">⭐</div>
                    <p>Brak ocen do wyświetlenia</p>
                </div>
            ) : (
                <>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Ocena</th>
                                <th>Komentarz</th>
                                <th>Oceniający</th>
                                <th>Oceniany</th>
                                <th>Data</th>
                                <th>Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ratings.map(r => (
                                <tr key={r.id}>
                                    <td>
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < r.score ? 'admin-star' : ''}>
                                                {i < r.score ? '★' : '☆'}
                                            </span>
                                        ))}
                                    </td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {r.comment || '-'}
                                    </td>
                                    <td>{r.rater?.firstName} {r.rater?.lastName}</td>
                                    <td>{r.rated?.firstName} {r.rated?.lastName}</td>
                                    <td>{new Date(r.createdAt).toLocaleDateString('pl-PL')}</td>
                                    <td className="admin-table-actions">
                                        <button
                                            className="admin-btn admin-btn-danger admin-btn-small"
                                            onClick={() => handleDeleteRating(r.id)}
                                        >
                                            🗑️
                                        </button>
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
                                ← Poprzednia
                            </button>
                            <span className="admin-pagination-info">
                                Strona {currentPage} z {totalPages}
                            </span>
                            <button
                                className="admin-pagination-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                Następna →
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
                <h2>🏘️ Zarządzanie Osiedlami</h2>
            </div>
            {isLoading ? (
                <div className="admin-loading">Ładowanie...</div>
            ) : neighborhoods.length === 0 ? (
                <div className="admin-empty">
                    <div className="admin-empty-icon">🏘️</div>
                    <p>Brak osiedli do wyświetlenia</p>
                </div>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Nazwa</th>
                            <th>Miasto</th>
                            <th>Administrator</th>
                            <th>Członkowie</th>
                            <th>Typ</th>
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
                                    <td>{n.admin?.firstName} {n.admin?.lastName}</td>
                                    <td>{n.members?.length || 0}</td>
                                    <td>
                                        <span className={`admin-badge admin-badge-${n.isPrivate ? 'private' : 'public'}`}>
                                            {n.isPrivate ? 'Prywatne' : 'Publiczne'}
                                        </span>
                                    </td>
                                </tr>
                                {expandedNeighborhood === n.id && (
                                    <tr className="admin-expandable-row">
                                        <td colSpan={6}>
                                            <div className="admin-expandable-content">
                                                <strong>Członkowie:</strong>
                                                <div className="admin-members-list">
                                                    {n.members?.map(m => (
                                                        <div key={m.id} className="admin-member-chip">
                                                            {m.firstName} {m.lastName}
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
            )}
        </div>
    );

    const renderEditModal = () => {
        if (!editModal) return null;

        if (editModal.type === 'announcement') {
            return (
                <div className="admin-modal-overlay" onClick={() => setEditModal(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h3>Edytuj Ogłoszenie</h3>
                        <div className="admin-form-group">
                            <label>Tytuł</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label>Treść</label>
                            <textarea
                                className="admin-form-textarea"
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label>Status</label>
                            <select
                                className="admin-form-select"
                                value={editStatus}
                                onChange={e => setEditStatus(e.target.value)}
                            >
                                <option value="ACTIVE">Aktywne</option>
                                <option value="IN_PROGRESS">W trakcie</option>
                                <option value="COMPLETED">Zakończone</option>
                            </select>
                        </div>
                        <div className="admin-modal-actions">
                            <button className="admin-btn admin-btn-secondary" onClick={() => setEditModal(null)}>
                                Anuluj
                            </button>
                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={() => handleUpdateAnnouncement(editModal.item.id, { title: editTitle, content: editContent, status: editStatus })}
                            >
                                Zapisz
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
                        Użytkownicy
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'announcements' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('announcements')}
                    >
                        <span className="icon">📢</span>
                        Ogłoszenia
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'ratings' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('ratings')}
                    >
                        <span className="icon">⭐</span>
                        Oceny
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'neighborhoods' ? 'active' : ''}`}
                        onClick={() => handleSectionChange('neighborhoods')}
                    >
                        <span className="icon">🏘️</span>
                        Osiedla
                    </button>
                </nav>
                <div className="admin-sidebar-footer">
                    <button className="admin-back-btn" onClick={() => navigate('/home')}>
                        ← Powrót do aplikacji
                    </button>
                </div>
            </aside>
            <main className="admin-main">
                {activeSection === 'dashboard' && renderDashboard()}
                {activeSection === 'users' && renderUsers()}
                {activeSection === 'announcements' && renderAnnouncements()}
                {activeSection === 'ratings' && renderRatings()}
                {activeSection === 'neighborhoods' && renderNeighborhoods()}
            </main>
            {renderEditModal()}
        </div>
    );
};
