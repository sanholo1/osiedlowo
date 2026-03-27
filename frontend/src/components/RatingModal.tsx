import React, { useState, useEffect } from 'react';
import '../styles/RatingModal.css';

interface RatingModalProps {
    toUserId: string;
    toUserName: string;
    announcementId: string;
    announcementTitle: string;
    existingRating?: {
        id: string;
        stars: number;
        comment: string;
    };
    onClose: () => void;
    onSuccess: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
    toUserId,
    toUserName,
    announcementId,
    announcementTitle,
    existingRating,
    onClose,
    onSuccess
}) => {
    const [stars, setStars] = useState(existingRating?.stars || 0);
    const [comment, setComment] = useState(existingRating?.comment || '');
    const [hoveredStar, setHoveredStar] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (stars === 0) {
            setError('Wybierz liczbę gwiazdek');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const url = existingRating
                ? `http://localhost:3001/api/ratings/${existingRating.id}`
                : 'http://localhost:3001/api/ratings';

            const method = existingRating ? 'PUT' : 'POST';

            const body = existingRating
                ? { stars, comment }
                : { toUserId, announcementId, stars, comment };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await response.json();
                setError(data.message || 'Nie udało się zapisać oceny');
            }
        } catch (err) {
            setError('Błąd połączenia z serwerem');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStarInput = () => {
        return (
            <div className="star-input">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= (hoveredStar || stars) ? 'filled' : ''}`}
                        onClick={() => setStars(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                    >
                        ★
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content rating-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>

                <h2>{existingRating ? 'Edytuj ocenę' : 'Wystaw ocenę'}</h2>

                <div className="rating-context">
                    <p><strong>Użytkownik:</strong> {toUserName}</p>
                    <p><strong>Ogłoszenie:</strong> {announcementTitle}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Ocena *</label>
                        {renderStarInput()}
                        {stars > 0 && (
                            <p className="star-label">
                                {stars === 1 && 'Bardzo słabo'}
                                {stars === 2 && 'Słabo'}
                                {stars === 3 && 'Średnio'}
                                {stars === 4 && 'Dobrze'}
                                {stars === 5 && 'Świetnie'}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Komentarz (opcjonalnie)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Dodaj komentarz do swojej oceny..."
                            maxLength={500}
                            rows={4}
                        />
                        <span className="char-count">{comment.length}/500</span>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isSubmitting || stars === 0}
                        >
                            {isSubmitting ? 'Zapisywanie...' : (existingRating ? 'Zapisz zmiany' : 'Wystaw ocenę')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
