import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { ACTIVITY_CATEGORIES, MAX_ATTRIBUTES, MAX_ATTRIBUTE_LENGTH } from '../config/activityAttributes';
import '../styles/ProfilePage.css';
import '../styles/ProfilePageExtensions.css';

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { t } = useSettings();
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: ''
    });
    const [attributes, setAttributes] = useState<string[]>([]);
    const [newAttribute, setNewAttribute] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [showAttributeSelector, setShowAttributeSelector] = useState(false);
    const [ratings, setRatings] = useState<any[]>([]);
    const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
    const [showRatings, setShowRatings] = useState(false);
    const [showBlockedUsers, setShowBlockedUsers] = useState(false);

    useEffect(() => {
        if (user?.attributes) {
            setAttributes(user.attributes);
        }
        if (user?.id) {
            fetchRatings();
            fetchBlockedUsers();
        }
    }, [user]);

    const fetchRatings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/ratings/user/${user?.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setRatings(data.data);
            }
        } catch (err) {
            console.error('Error fetching ratings:', err);
        }
    };

    const fetchBlockedUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/users/blocked', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setBlockedUsers(data.data);
            }
        } catch (err) {
            console.error('Error fetching blocked users:', err);
        }
    };

    const handleUnblock = async (blockedUserId: string) => {
        if (!window.confirm(t('profile_unblock_confirm'))) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/users/block/${blockedUserId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchBlockedUsers();
                setMessage(t('profile_unblock_success'));
            }
        } catch (err) {
            setMessage(t('profile_unblock_error'));
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < rating ? 'star filled' : 'star'}>
                ★
            </span>
        ));
    };

    if (!user) {
        return null;
    }

    const isSystemAdmin = user.role === 'admin';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAddAttribute = () => {
        const trimmed = newAttribute.trim();
        if (trimmed && !attributes.includes(trimmed)) {
            if (attributes.length >= MAX_ATTRIBUTES) {
                setMessage(`${t('profile_max_limit')} ${MAX_ATTRIBUTES}`);
                return;
            }
            if (trimmed.length > MAX_ATTRIBUTE_LENGTH) {
                setMessage(`${t('profile_max_length')} ${MAX_ATTRIBUTE_LENGTH}`);
                return;
            }
            setAttributes([...attributes, trimmed]);
            setNewAttribute('');
        }
    };

    const handleToggleAttribute = (attr: string) => {
        if (attributes.includes(attr)) {
            setAttributes(attributes.filter(a => a !== attr));
        } else {
            if (attributes.length >= MAX_ATTRIBUTES) {
                setMessage(`${t('profile_max_limit')} ${MAX_ATTRIBUTES}`);
                return;
            }
            setAttributes([...attributes, attr]);
        }
    };

    const handleRemoveAttribute = (attrToRemove: string) => {
        setAttributes(attributes.filter(attr => attr !== attrToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddAttribute();
        }
    };

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const getFilteredCategories = () => {
        if (!searchQuery.trim()) {
            return ACTIVITY_CATEGORIES;
        }
        const query = searchQuery.toLowerCase();
        return ACTIVITY_CATEGORIES.map(category => ({
            ...category,
            attributes: category.attributes.filter(attr =>
                attr.toLowerCase().includes(query)
            )
        })).filter(category => category.attributes.length > 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            if (isSystemAdmin) {
                setMessage(t('profile_update_error'));
                setIsLoading(false);
                return;
            }

            const updateData: any = {};
            if (formData.email) updateData.email = formData.email;
            if (formData.firstName) updateData.firstName = formData.firstName;
            if (formData.lastName) updateData.lastName = formData.lastName;
            if (formData.address) updateData.address = formData.address;
            updateData.attributes = attributes;

            if (Object.keys(updateData).length === 0) {
                setMessage(t('profile_fill_one'));
                setIsLoading(false);
                return;
            }

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(t('profile_update_success'));
                if (updateUser && data.data) {
                    updateUser(data.data);
                }
                setFormData({
                    email: '',
                    firstName: '',
                    lastName: '',
                    address: ''
                });
            } else {
                setMessage(data.message || t('profile_update_error'));
            }
        } catch (error) {
            setMessage(t('profile_connection_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCategories = getFilteredCategories();

    return (
        <div id="profile-container">
            <div id="profile-data">
                <div><span data-i18n="profile_email">{t('profile_email')}</span> {user.email}</div>
                <div><span data-i18n="profile_firstname">{t('profile_firstname')}</span> {user.firstName}</div>
                <div><span data-i18n="profile_lastname">{t('profile_lastname')}</span> {user.lastName}</div>
                <div><span data-i18n="profile_address">{t('profile_address')}</span> {user.address || t('profile_not_set')}</div>

                {/* Rating display */}
                {user.averageRating !== undefined && user.totalRatings !== undefined && (
                    <div className="rating-section">
                        <strong data-i18n="profile_reputation">{t('profile_reputation')}</strong>
                        <div className="stars-display">
                            {renderStars(Math.round(user.averageRating))}
                            <span className="rating-text">
                                {user.averageRating.toFixed(1)} ({user.totalRatings} {t('profile_rating_count')})
                            </span>
                        </div>
                    </div>
                )}

                {user.attributes && user.attributes.length > 0 && (
                    <div className="user-attributes-display">
                        <strong data-i18n="profile_activities">{t('profile_activities')}</strong>
                        <div className="attribute-tags-display">
                            {user.attributes.map((attr, index) => (
                                <span key={index} className="attribute-tag-display">{t(attr)}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Show received ratings */}
                <div className="profile-section">
                    <button
                        className="toggle-section-btn"
                        onClick={() => setShowRatings(!showRatings)}
                    >
                        {showRatings ? '▲' : '▼'} {t('profile_toggle_reviews')} ({ratings.length})
                    </button>
                    {showRatings && (
                        <div className="ratings-list">
                            {ratings.length === 0 ? (
                                <p className="no-items" data-i18n="profile_no_reviews">{t('profile_no_reviews')}</p>
                            ) : (
                                ratings.map((rating: any) => (
                                    <div key={rating.id} className="rating-item">
                                        <div className="rating-header">
                                            <strong>{rating.fromUser.firstName} {rating.fromUser.lastName}</strong>
                                            <div className="stars-display">
                                                {renderStars(rating.stars)}
                                            </div>
                                        </div>
                                        {rating.comment && <p>{rating.comment}</p>}
                                        <span className="rating-date">
                                            {new Date(rating.createdAt).toLocaleDateString('pl-PL')}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Blocked users */}
                <div className="profile-section">
                    <button
                        className="toggle-section-btn"
                        onClick={() => setShowBlockedUsers(!showBlockedUsers)}
                    >
                        {showBlockedUsers ? '▲' : '▼'} {t('profile_toggle_blocked')} ({blockedUsers.length})
                    </button>
                    {showBlockedUsers && (
                        <div className="blocked-users-list">
                            {blockedUsers.length === 0 ? (
                                <p className="no-items" data-i18n="profile_no_blocked">{t('profile_no_blocked')}</p>
                            ) : (
                                blockedUsers.map((blocked: any) => (
                                    <div key={blocked.id} className="blocked-user-item">
                                        <span>{blocked.blockedUser.firstName} {blocked.blockedUser.lastName}</span>
                                        <button
                                            className="unblock-btn"
                                            onClick={() => handleUnblock(blocked.blockedUserId)}
                                            data-i18n="profile_unblock"
                                        >
                                            {t('profile_unblock')}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div id="change-data">
                {isSystemAdmin && (
                    <div className="admin-warning" style={{
                        background: 'var(--error)',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        ⚠️ Konto System Admin nie może edytować profilu. Jest to konto techniczne/serwisowe.
                    </div>
                )}
                <form className='datachange-form' onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder={t('profile_placeholder_email')}
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isLoading || isSystemAdmin}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="firstName"
                            placeholder={t('profile_placeholder_firstname')}
                            value={formData.firstName}
                            onChange={handleInputChange}
                            disabled={isLoading || isSystemAdmin}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="lastName"
                            placeholder={t('profile_placeholder_lastname')}
                            value={formData.lastName}
                            onChange={handleInputChange}
                            disabled={isLoading || isSystemAdmin}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="address"
                            placeholder={t('profile_placeholder_address')}
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={isLoading || isSystemAdmin}
                        />
                    </div>

                    <div className="attributes-section">
                        <div className="attributes-header">
                            <h3 data-i18n="profile_activities_header">{t('profile_activities_header')}</h3>
                            <span className="attributes-counter">
                                {attributes.length}/{MAX_ATTRIBUTES}
                            </span>
                        </div>

                        {/* Selected attributes */}
                        {attributes.length > 0 && (
                            <div className="selected-attributes">
                                {attributes.map((attr, index) => (
                                    <div key={index} className="attribute-tag selected">
                                        <span>{t(attr)}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAttribute(attr)}
                                            className="remove-attribute-btn"
                                            disabled={isLoading || isSystemAdmin}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Toggle button for attribute selector */}
                        <button
                            type="button"
                            className="toggle-selector-btn"
                            onClick={() => setShowAttributeSelector(!showAttributeSelector)}
                        >
                            {showAttributeSelector ? `▲ ${t('profile_selector_hide')}` : `▼ ${t('profile_selector_show')}`}
                        </button>

                        { }
                        {showAttributeSelector && (
                            <div className="attribute-selector">
                                { }
                                <div className="attribute-search">
                                    <input
                                        type="text"
                                        placeholder={`🔍 ${t('profile_selector_search')}`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="search-input"
                                    />
                                </div>

                                { }
                                <div className="categories-container">
                                    {filteredCategories.map(category => (
                                        <div key={category.id} className="category-section">
                                            <button
                                                type="button"
                                                className={`category-header ${expandedCategories.includes(category.id) ? 'expanded' : ''}`}
                                                onClick={() => toggleCategory(category.id)}
                                            >
                                                <span className="category-icon">{category.icon}</span>
                                                <span className="category-name">{t('cat_' + category.id)}</span>
                                                <span className="category-count">
                                                    ({category.attributes.filter(a => attributes.includes(a)).length}/{category.attributes.length})
                                                </span>
                                                <span className="expand-icon">
                                                    {expandedCategories.includes(category.id) ? '−' : '+'}
                                                </span>
                                            </button>
                                            {expandedCategories.includes(category.id) && (
                                                <div className="category-attributes">
                                                    {category.attributes.map((attr, idx) => (
                                                        <label
                                                            key={idx}
                                                            className={`attribute-option ${attributes.includes(attr) ? 'selected' : ''}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={attributes.includes(attr)}
                                                                onChange={() => handleToggleAttribute(attr)}
                                                                disabled={isLoading || isSystemAdmin}
                                                            />
                                                            <span>{t(attr)}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Custom attribute input */}
                        <div className="custom-attribute-section">
                            <h4 data-i18n="profile_custom_attr_header">{t('profile_custom_attr_header')}</h4>
                            <div className="add-attribute-container">
                                <input
                                    type="text"
                                    value={newAttribute}
                                    onChange={(e) => setNewAttribute(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={t('profile_custom_attr_placeholder')}
                                    disabled={isLoading || isSystemAdmin}
                                    maxLength={MAX_ATTRIBUTE_LENGTH}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddAttribute}
                                    disabled={isLoading || !newAttribute.trim() || isSystemAdmin}
                                    className="add-attribute-btn"
                                    data-i18n="profile_attr_add_btn"
                                >
                                    {t('profile_attr_add_btn')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button className='button-profile-page' type="submit" disabled={isLoading || isSystemAdmin} data-i18n={isLoading ? "profile_saving_btn" : "profile_save_btn"}>
                        {isLoading ? t('profile_saving_btn') : t('profile_save_btn')}
                    </button>
                </form>
                {message && <div className={`profile-message ${message.includes('błąd') || message.includes('Błąd') || message.includes('Maksymalna') || message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}
            </div>
            <button className='button-profile-page' onClick={() => navigate('/home')} data-i18n="back_home">{t('back_home')}</button>
        </div>
    );
};