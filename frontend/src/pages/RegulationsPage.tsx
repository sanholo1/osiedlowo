import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

export const RegulationsPage: React.FC = () => {
    const { t, lang, setLang, theme, toggleTheme } = useSettings();

    return (
        <div id="container-log-reg" className="regulations-page">
            {}
            <div className="login-controls">
                <button
                    type="button"
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <select
                    className="language-select"
                    value={lang}
                    onChange={(e) => setLang(e.target.value as 'pl' | 'en')}
                    title={t('appearance_language')}
                >
                    <option value="pl">🇵🇱 PL</option>
                    <option value="en">🇬🇧 EN</option>
                </select>
            </div>

            <h1 data-i18n="regulations_title">{t('regulations_title')}</h1>

            <div className="regulations-content">
                <section>
                    <h2 data-i18n="regulations_section1_title">{t('regulations_section1_title')}</h2>
                    <p data-i18n="regulations_section1_content">{t('regulations_section1_content')}</p>
                </section>

                <section>
                    <h2 data-i18n="regulations_section2_title">{t('regulations_section2_title')}</h2>
                    <p data-i18n="regulations_section2_content">{t('regulations_section2_content')}</p>
                </section>

                <section>
                    <h2 data-i18n="regulations_section3_title">{t('regulations_section3_title')}</h2>
                    <p data-i18n="regulations_section3_content">{t('regulations_section3_content')}</p>
                </section>

                <section>
                    <h2 data-i18n="regulations_section4_title">{t('regulations_section4_title')}</h2>
                    <p data-i18n="regulations_section4_content">{t('regulations_section4_content')}</p>
                </section>

                <section>
                    <h2 data-i18n="regulations_section5_title">{t('regulations_section5_title')}</h2>
                    <p data-i18n="regulations_section5_content">{t('regulations_section5_content')}</p>
                </section>

                <section>
                    <h2 data-i18n="regulations_section6_title">{t('regulations_section6_title')}</h2>
                    <p data-i18n="regulations_section6_content">{t('regulations_section6_content')}</p>
                </section>
            </div>

            <p>
                <Link to="/login" data-i18n="regulations_back">{t('regulations_back')}</Link>
            </p>
        </div>
    );
};