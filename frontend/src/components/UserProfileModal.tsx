import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import '../styles/UserProfileModal.css';

interface Rating {
    id: string;
    fromUserId: string;
    stars: number;
    comment: string;
    fromUser: {
        id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    attributes: string[];
    averageRating?: number;
    totalRatings?: number;
}

interface UserProfileModalProps {
    userId: string;
    currentUserId: string;
    onClose: () => void;
    onRate?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
    userId,
    currentUserId,
    onClose,
    onRate
}) => {
    const { t } = useSettings();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
        fetchRatings();
        checkIfBlocked();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data.data);
            } else {
                setError(t('profile_modal_error_fetch'));
            }
        } catch (err) {
            setError(t('profile_connection_error'));
        }
    };

    const fetchRatings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/ratings/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setRatings(data.data);
            }
        } catch (err) {
            console.error('Error fetching ratings:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const checkIfBlocked = async () => {
        if (userId === currentUserId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/users/blocked`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const blocked = data.data.some((bu: any) => bu.blockedUserId === userId);
                setIsBlocked(blocked);
            }
        } catch (err) {
            console.error('Error checking block status:', err);
        }
    };

    const handleBlock = async () => {
        if (!window.confirm(t('profile_modal_block_confirm'))) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/users/block/${userId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setIsBlocked(true);
                alert(t('profile_modal_block_success'));
            } else {
                const data = await response.json();
                alert(data.message || 'Nie udało się zablokować użytkownika');
            }
        } catch (err) {
            alert('Błąd połączenia z serwerem');
        }
    };

    const handleUnblock = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/users/block/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setIsBlocked(false);
                alert(t('profile_modal_unblock_success'));
            } else {
                const data = await response.json();
                alert(data.message || 'Nie udało się odblokować użytkownika');
            }
        } catch (err) {
            alert('Błąd połączenia z serwerem');
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < rating ? 'star filled' : 'star'}>
                ★
            </span>
        ));
    };

    if (isLoading) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content user-profile-modal" onClick={(e) => e.stopPropagation()}>
                    <p>{t('profile_modal_loading')}</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content user-profile-modal" onClick={(e) => e.stopPropagation()}>
                    <p className="error">{error || 'Nie udało się załadować profilu'}</p>
                    <button onClick={onClose}>Zamknij</button>
                </div>
            </div>
        );
    }

    const isOwnProfile = userId === currentUserId;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content user-profile-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>

                <div className="profile-header">
                    <h2>{profile.firstName} {profile.lastName}</h2>
                    {profile.averageRating !== undefined && profile.totalRatings !== undefined && (
                        <div className="rating-summary">
                            <div className="stars-display">
                                {renderStars(Math.round(profile.averageRating))}
                            </div>
                            <span className="rating-text">
                                {profile.averageRating.toFixed(1)} ({profile.totalRatings} {profile.totalRatings === 1 ? 'ocena' : 'ocen'})
                            </span>
                        </div>
                    )}
                </div>

                <div className="profile-details">
                    {profile.address && (
                        <div className="detail-row">
                            <strong>{t('profile_address')}</strong> {profile.address}
                        </div>
                    )}
                    {profile.attributes && profile.attributes.length > 0 && (
                        <div className="detail-row">
                            <strong>{t('profile_modal_interests')}</strong>
                            <div className="attributes-list">
                                {profile.attributes.map((attr, idx) => (
                                    <span key={idx} className="attribute-tag">{t(attr)}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {!isOwnProfile && (
                    <div className="profile-actions">
                        {onRate && (
                            <button className="rate-btn" onClick={onRate}>
                                ⭐ {t('profile_modal_rate_btn')}
                            </button>
                        )}
                        {isBlocked ? (
                            <button className="unblock-btn" onClick={handleUnblock}>
                                {t('profile_modal_unblock_btn')}
                            </button>
                        ) : (
                            <button className="block-btn" onClick={handleBlock}>
                                🚫 {t('profile_modal_block_btn')}
                            </button>
                        )}
                    </div>
                )}

                <div className="ratings-section">
                    <h3>{t('profile_modal_reviews_header')} ({ratings.length})</h3>
                    {ratings.length === 0 ? (
                        <p className="no-ratings">{t('profile_no_reviews')}</p>
                    ) : (
                        <div className="ratings-list">
                            {ratings.map((rating) => (
                                <div key={rating.id} className="rating-item">
                                    <div className="rating-header">
                                        <strong>{rating.fromUser.firstName} {rating.fromUser.lastName}</strong>
                                        <div className="stars-display">
                                            {renderStars(rating.stars)}
                                        </div>
                                    </div>
                                    {rating.comment && <p className="rating-comment">{rating.comment}</p>}
                                    <span className="rating-date">
                                        {new Date(rating.createdAt).toLocaleDateString('pl-PL', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
