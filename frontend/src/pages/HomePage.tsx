import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { NotificationBell } from '../components/NotificationBell';
import { UnreadBadge } from '../components/UnreadBadge';

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t } = useSettings();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        return null;
    }

    return (
        <div className="home-container">
            <nav>
                <div>
                    <h1><svg viewBox="0 0 1024 1024" width="32px" height="32px" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M896 832H128V490.666667L512 128l384 362.666667z" fill="#E8EAF6"></path><path d="M832 448l-106.666667-106.666667V192h106.666667zM128 832h768v106.666667H128z" fill="#C5CAE9"></path><path d="M512 91.733333L85.333333 488.533333l42.666667 46.933334L512 179.2l384 356.266667 42.666667-46.933334z" fill="#B71C1C"></path><path d="M384 597.333333h256v341.333334H384z" fill="#D84315"></path><path d="M448 362.666667h128v128h-128z" fill="#01579B"></path><path d="M586.666667 757.333333c-6.4 0-10.666667 4.266667-10.666667 10.666667v42.666667c0 6.4 4.266667 10.666667 10.666667 10.666666s10.666667-4.266667 10.666666-10.666666v-42.666667c0-6.4-4.266667-10.666667-10.666666-10.666667z" fill="#FF8A65"></path></g></svg>Osiedlowo</h1>
                </div>
                <div className="nav-right">
                    <NotificationBell />
                    <span>{user.firstName} {user.lastName}</span>
                    <button onClick={handleLogout} data-i18n="nav_logout">{t('nav_logout')}</button>
                </div>
            </nav>
            <h2 data-i18n="home_welcome">{t('home_welcome')}</h2>
            <p><span data-i18n="home_hello">{t('home_hello')}</span> {user.firstName}<span data-i18n="home_hello_suffix">{t('home_hello_suffix')}</span></p>
            <main>
                <div>
                    <h3 data-i18n="home_profile_title">{t('home_profile_title')}</h3>
                    <p className="profile-short-data"><span data-i18n="home_profile_email">{t('home_profile_email')}</span> {user.email}</p>
                    <p className="profile-short-data"><span data-i18n="home_profile_name">{t('home_profile_name')}</span> {user.firstName}</p>
                    <p className="profile-short-data"><span data-i18n="home_profile_lastname">{t('home_profile_lastname')}</span> {user.lastName}</p>
                    {user.address && <p className="profile-short-data"><span data-i18n="home_profile_address">{t('home_profile_address')}</span> {user.address}</p>}
                    <button onClick={() => navigate('/profile')} data-i18n="home_profile_btn">{t('home_profile_btn')}</button>
                </div>

                <div>
                    <h3 data-i18n="home_groups_title">{t('home_groups_title')}</h3>
                    <p data-i18n="home_groups_desc">{t('home_groups_desc')}</p>
                    <button onClick={() => navigate('/groupslist')} data-i18n="home_groups_btn">{t('home_groups_btn')}</button>
                </div>

                <div>
                    <h3 data-i18n="home_search_title">{t('home_search_title')}</h3>
                    <p data-i18n="home_search_desc">{t('home_search_desc')}</p>
                    <button onClick={() => navigate('/search')} data-i18n="home_search_btn">{t('home_search_btn')}</button>
                </div>

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 data-i18n="home_messages_title">{t('home_messages_title')}</h3>
                        <UnreadBadge />
                    </div>
                    <p data-i18n="home_messages_desc">{t('home_messages_desc')}</p>
                    <button onClick={() => navigate('/messages')} data-i18n="home_messages_btn">{t('home_messages_btn')}</button>
                </div>

                <div>
                    <h3 data-i18n="home_create_title">{t('home_create_title')}</h3>
                    <p data-i18n="home_create_desc">{t('home_create_desc')}</p>
                    <button onClick={() => navigate('/groupcreating')} data-i18n="home_create_btn">{t('home_create_btn')}</button>
                </div>

                <div>
                    <h3 data-i18n="settings_title">{t('settings_title')}</h3>
                    <p data-i18n="home_settings_desc">{t('home_settings_desc')}</p>
                    <button onClick={() => navigate('/settings')} data-i18n="home_settings_btn">{t('home_settings_btn')}</button>
                </div>
            </main>

            <footer>
                <p data-i18n="footer_text">{t('footer_text')}</p>
            </footer>
        </div>
    );
};
