import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/SettingsPage.css';

export const SettingsPage: React.FC = () => {

    const { lang, setLang, theme, toggleTheme, t } = useSettings();
    const { user } = useAuth();


    const [notificationsEnabled, setNotificationsEnabled] = useState(false);


    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        if ('Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
        }




    }, []);

    const handleNotificationToggle = async () => {
        if (!('Notification' in window)) {
            alert(t('notifications_error'));
            return;
        }

        if (notificationsEnabled) {
            alert(t('notifications_manual_error'));
        } else {
            const permission = await Notification.requestPermission();
            setNotificationsEnabled(permission === 'granted');
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
        setPasswordError('');
        setPasswordSuccess('');
    };

    const submitPasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwords.newPassword.length < 6) {
            setPasswordError(t('security_error_length'));
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setPasswordError(t('security_error_match'));
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/users/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token} `
                },
                body: JSON.stringify({
                    oldPassword: passwords.oldPassword,
                    newPassword: passwords.newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error occurred');
            }

            setPasswordSuccess(t('security_success'));
            setPasswords({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error: any) {
            setPasswordError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="settings-page-wrapper">
            <div className="settings-container">
                <h1 data-i18n="settings_title">{t('settings_title')}</h1>

                {/* Appearance Section */}
                <div className="settings-section">
                    <h2 data-i18n="appearance_section">{t('appearance_section')}</h2>
                    <div className="appearance-controls">
                        <div className="control-group">
                            <label data-i18n="appearance_language">{t('appearance_language')}</label>
                            <select
                                className="lang-select"
                                value={lang}
                                onChange={(e) => setLang(e.target.value as 'pl' | 'en')}
                            >
                                <option value="pl">Polski</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        <div className="control-group">
                            <label data-i18n="appearance_theme_dark">{t('appearance_theme_dark')}</label>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={theme === 'dark'}
                                    onChange={toggleTheme}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                { }
                <div className="settings-section">
                    <h2 data-i18n="notifications_section">{t('notifications_section')}</h2>
                    <div className="notification-toggle">
                        <span className="toggle-label" data-i18n="notifications_browser">
                            {t('notifications_browser')}
                        </span>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={notificationsEnabled}
                                onChange={handleNotificationToggle}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '10px' }}
                        data-i18n={notificationsEnabled ? "notifications_on_desc" : "notifications_off_desc"}>
                        {notificationsEnabled ? t('notifications_on_desc') : t('notifications_off_desc')}
                    </p>
                </div>

                { }
                <div className="settings-section">
                    <h2 data-i18n="security_section">{t('security_section')}</h2>
                    {passwordSuccess && <div className="success-message" data-i18n="security_success">{passwordSuccess}</div>}

                    <form onSubmit={submitPasswordChange} className="password-form">
                        <div className="form-group">
                            <label data-i18n="security_old_password">{t('security_old_password')}</label>
                            <input
                                type="password"
                                name="oldPassword"
                                value={passwords.oldPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label data-i18n="security_new_password">{t('security_new_password')}</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label data-i18n="security_confirm_password">{t('security_confirm_password')}</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        {passwordError && <div className="error-message">{passwordError}</div>}

                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting
                                ? <span data-i18n="security_changing_btn">{t('security_changing_btn')}</span>
                                : <span data-i18n="security_change_btn">{t('security_change_btn')}</span>
                            }
                        </button>
                    </form>
                </div>

                <p>
                    <Link to={user?.role === 'admin' ? "/admin" : "/home"} data-i18n={user?.role === 'admin' ? "back_admin" : "back_home"}>
                        {user?.role === 'admin' ? t('back_admin') : t('back_home')}
                    </Link>
                </p>
            </div>
        </div>
    );
};