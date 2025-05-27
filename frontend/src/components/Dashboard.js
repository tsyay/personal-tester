import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Welcome, {user.full_name}!</h2>
                <div className="form-group">
                    <p><strong>Email:</strong> {user.username}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                </div>
                <button 
                    onClick={handleLogout}
                    className="auth-button"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Dashboard; 