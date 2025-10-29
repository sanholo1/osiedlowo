import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
    const { user, token, logout, message } = useAuth();

    if (!user || !token) {
        return null;
    }

    return (
        <div className="dashboard-container">
            <h1>🏘️ Osiedlowo - Dashboard</h1>
            <div className="user-info">
                <h2>
                    Witaj, {user.firstName} {user.lastName}!
                </h2>
                <p>
                    <strong>Email:</strong> {user.email}
                </p>
                <p>
                    <strong>ID:</strong> {user.id}
                </p>
                <p>
                    <strong>Token:</strong> {token.substring(0, 50)}...
                </p>
                <button onClick={logout} className="button button-danger">
                    Wyloguj
                </button>
            </div>
            {message && <div className="message message-success">{message}</div>}
        </div>
    );
};