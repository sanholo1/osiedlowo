import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div id="container-log-reg">
            <h1>Ustawienia</h1>
            <div>
                Jakieś ustawienia które ustalimy
            </div>
            <p>
                <Link to="/home">Powrót</Link>
            </p>
        </div>
    );
};