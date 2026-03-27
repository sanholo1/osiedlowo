import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const UsersGroupsListPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <h2>Twoje osiedla</h2>
            <main>
                <div>
                    <p>Nazwa osiedla: </p>
                    <p>Miasto: </p>
                    <p>Adres: </p>
                    <button>Wybierz</button>
                </div>
            </main>
        </div>
    );
};