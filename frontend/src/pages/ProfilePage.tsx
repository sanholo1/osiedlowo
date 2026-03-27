import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    if (!user) {
        return null;
    }

    return (
    <div id="profile-container">
        <div id="profile-data">
            <div>Email: {user.email}</div>
            <div>Imię: {user.firstName}</div>
            <div>Nazwisko: {user.lastName}</div>
            <div>Adres: </div>
        </div>
        <div id="change-data">
            <form>
                <div>
                    <input type="email" name="changeEmail" placeholder="Zmień email"/>
                </div>
                <div>
                    <input type="text" name="changeFirstName" placeholder="Zmień imię"/>
                </div>
                <div>
                    <input type="text" name="changeLastName" placeholder="Zmień nazwisko"/>
                </div>
                <div>
                    <input type="text" name="changeAddress" placeholder="Ustaw adres domowy"/>
                </div>
                <button type="submit">Zapisz zmiany</button>
            </form>
        </div>
        <div id="skills-list">
            <p>
                Twoje umiejętności: 
            </p>
            <form>
                <div>
                    <input type="checkbox" name="optionA" id="optionA"/>
                    <label>Opcja A</label>
                </div>
                <div>
                    <input type="checkbox" name="optionB" id="optionB"/>
                    <label>Opcja B</label>
                </div>
                <div>
                    <input type="checkbox" name="optionC" id="optionC"/>
                    <label>Opcja C</label>
                </div>
                <div>
                    <input type="checkbox" name="optionD" id="optionD"/>
                    <label>Opcja D</label>
                </div>
                <button type="submit">Zapisz umiejętności</button>
            </form>
        </div>
        <button>Powrót do Strony Głównej</button>
    </div>
    );
};