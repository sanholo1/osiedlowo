import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        return null;
    }

    return (
        <div>
            <nav>
                <h1>Osiedlowo</h1>
                <span>{user.firstName} {user.lastName}</span>
                <button onClick={handleLogout}>Wyloguj</button>
            </nav>

            <main>
                <h2>Witaj w Osiedlowo!</h2>
                <p>Cześć {user.firstName}! Miło Cię widzieć.</p>

                <div>
                    <h3>Profil użytkownika</h3>
                    <p>Email: {user.email}</p>
                    <p>Imię: {user.firstName}</p>
                    <p>Nazwisko: {user.lastName}</p>
                    <p>ID: {user.id}</p>
                </div>

                <div>
                    <h3>Moje Osiedle</h3>
                    <p>Zarządzaj swoim osiedlem i komunikuj się z sąsiadami.</p>
                    <button>Zobacz osiedle</button>
                </div>

                <div>
                    <h3>Ogłoszenia</h3>
                    <p>Sprawdź najnowsze ogłoszenia w Twoim osiedlu.</p>
                    <button>Przeglądaj ogłoszenia</button>
                </div>

                <div>
                    <h3>Wiadomości</h3>
                    <p>Komunikuj się z mieszkańcami osiedla.</p>
                    <button>Otwórz wiadomości</button>
                </div>

                <div>
                    <h3>Wydarzenia</h3>
                    <p>Zobacz nadchodzące wydarzenia i spotkania.</p>
                    <button>Kalendarz wydarzeń</button>
                </div>

                <div>
                    <h3>Ustawienia</h3>
                    <p>Zarządzaj swoimi ustawieniami i preferencjami.</p>
                    <button>Przejdź do ustawień</button>
                </div>
            </main>

            <footer>
                <p>&copy; 2025 Osiedlowo. Wszystkie prawa zastrzeżone.</p>
            </footer>
        </div>
    );
};
