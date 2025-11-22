import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const SearchForGroupPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <h2>Lista Osiedli</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nazwa</th>
                        <th>Miasto</th>
                        <th>Adres</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th><button>Dołącz</button></th>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};