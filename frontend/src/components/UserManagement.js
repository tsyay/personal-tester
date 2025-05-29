import React, { useState, useEffect } from 'react';
import '../styles/UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/users/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                setError('Не удалось загрузить список пользователей');
            }
        } catch (err) {
            setError('Ошибка сервера');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await fetch(`http://localhost:8000/api/users/${userId}/change_role/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });

            if (response.ok) {
                // Обновляем список пользователей
                fetchUsers();
            } else {
                setError('Не удалось изменить роль пользователя');
            }
        } catch (err) {
            setError('Ошибка сервера');
        }
    };

    if (loading) return <div className="loading">Загрузка пользователей...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="user-management-container">
            <h1>Управление пользователями</h1>
            
            <div className="users-list">
                {users.map(user => (
                    <div key={user.id} className="user-card">
                        <div className="user-info">
                            <h3>{user.full_name}</h3>
                            <p>Email: {user.email}</p>
                            <p>Текущая роль: {user.role === 'TEACHER' ? 'Преподаватель' : 'Студент'}</p>
                        </div>
                        
                        <div className="user-actions">
                            <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className="role-select"
                            >
                                <option value="STUDENT">Студент</option>
                                <option value="TEACHER">Преподаватель</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserManagement; 