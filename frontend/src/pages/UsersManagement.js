import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Trash2 } from 'lucide-react';
import '../styles/UsersManagement.css';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);
                const userResponse = await axios.get('http://localhost:8000/api/students/me/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const role = userResponse.data.role;
                if (role !== 'ADMIN' && role !== 'TEACHER') {
                    navigate('/');
                    return;
                }
                
                setUserRole(role);
                
                const usersResponse = await axios.get('http://localhost:8000/api/students/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUsers(usersResponse.data);
                setError(null);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login');
                    return;
                }
                setError('Ошибка при загрузке данных');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handlePositionChange = async (userId, newPosition) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.patch(`http://localhost:8000/api/students/${userId}/`, 
                { position: newPosition },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            // Обновляем список пользователей
            setUsers(users.map(user => 
                user.id === userId ? { ...user, position: newPosition } : user
            ));
        } catch (err) {
            console.error('Error updating user position:', err);
            setError('Ошибка при обновлении должности');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            await axios.delete(`http://localhost:8000/api/students/${userId}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setUsers(users.filter(user => user.id !== userId));
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Ошибка при удалении пользователя');
        }
    };

    const handleCreateUser = () => {
        navigate('/users/create');
    };

    if (loading) {
        return (
            <div className="users-management-container">
                <div className="loading-container">Загрузка...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="users-management-container">
                <div className="error-container">{error}</div>
            </div>
        );
    }

    return (
        <div className="users-management-container">
            <div className="users-header">
                <h1>Управление пользователями</h1>
                <button 
                    onClick={handleCreateUser}
                    className="create-user-button"
                >
                    <UserPlus className="button-icon" />
                    Создать пользователя
                </button>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ФИО</th>
                            <th>Email</th>
                            <th>Должность</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.full_name}</td>
                                <td>{user.username}</td>
                                <td>
                                    <select
                                        value={user.position}
                                        onChange={(e) => handlePositionChange(user.id, e.target.value)}
                                        className="position-select"
                                    >
                                        <option value="WAITER">Официант</option>
                                        <option value="BARTENDER">Бармен</option>
                                        <option value="MANAGER">Менеджер</option>
                                        <option value="CLEANER">Уборщик</option>
                                        <option value="COOK">Повар</option>
                                    </select>
                                </td>
                                <td className="actions-cell">
                                    <button
                                        className="save-button"
                                        onClick={() => handlePositionChange(user.id, user.position)}
                                    >
                                        Сохранить
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteUser(user.id)}
                                        title="Удалить пользователя"
                                    >
                                        <Trash2 className="button-icon" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersManagement; 