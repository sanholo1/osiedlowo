import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const GroupCreatingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div id="neighbourhood-creating-container">
            <h2>Stwórz swoje osiedle</h2>
            <form>
                <div>
                <label>Nazwa osiedla: </label>
                <input type="text" name="neighbourhoodCreatingName"/>
            </div>
            <div>
                <label>Miasto: </label>
                <input type="text" name="neighbourhoodCreatingCity"/>
            </div>
            <div>
                <h3>Status osiedla:</h3>
                <label>Publiczne</label>
                <input type="radio" name="neigh-status" id="neigh-pub" value="pub"/>
                <label>Prywatne</label>
                <input type="radio" name="neigh-status" id="neigh-priv" value="priv" checked/>
            </div>
            <button>Stwórz</button>
        </form>
    </div>
    );
};