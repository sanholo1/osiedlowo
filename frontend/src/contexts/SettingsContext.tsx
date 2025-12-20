import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import plData from '../locales/pl.json';
import enData from '../locales/en.json';

type Translations = Record<string, string>;

type Language = 'pl' | 'en';
type Theme = 'light' | 'dark';

interface SettingsContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    theme: Theme;
    toggleTheme: () => void;
    t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const locales: Record<Language, Translations> = {
    pl: plData,
    en: enData
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    
    const [lang, setLangState] = useState<Language>(() => {
        return (localStorage.getItem('app-lang') as Language) || 'pl';
    });

    const [theme, setThemeState] = useState<Theme>(() => {
        return (localStorage.getItem('app-theme') as Theme) || 'light';
    });

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('app-lang', newLang);
    };

    const toggleTheme = () => {
        setThemeState(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('app-theme', newTheme);
            return newTheme;
        });
    };

    
    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [theme]);

    const t = (key: string): string => {
        return locales[lang][key] || key;
    };

    return (
        <SettingsContext.Provider value={{ lang, setLang, theme, toggleTheme, t }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
