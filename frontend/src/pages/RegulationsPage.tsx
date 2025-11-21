import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const RegulationsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div id="container-log-reg">
            <h1>Regulamin serwisu</h1>
            <div>
                Tutaj będzie regulamin jak jakiś wymyślimy
            </div>
            <p>
                <Link to="/login">Powrót</Link>
            </p>
        </div>
    );
};