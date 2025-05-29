import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        role: ''
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Токен не найден');
            }

            const response = await axios.get('http://localhost:8000/api/students/me/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setUser(response.data);
            setFormData(prev => ({
                ...prev,
                email: response.data.email,
                role: response.data.role
            }));
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Не удалось загрузить данные пользователя');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEmailChange = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const response = await axios.post(
                'http://localhost:8000/api/students/change_email/',
                {
                    email: formData.email,
                    password: formData.currentPassword
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );

            setSuccess('Email успешно изменен');
            setFormData(prev => ({
                ...prev,
                currentPassword: ''
            }));
            fetchUserData(); // Обновляем данные пользователя
        } catch (err) {
            if (err.response?.data) {
                setError(err.response.data.error || 'Не удалось изменить email');
            } else {
                setError('Ошибка сервера');
            }
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:8000/api/students/change_password/',
                {
                    current_password: formData.currentPassword,
                    new_password: formData.newPassword
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );

            setSuccess('Пароль успешно изменен');
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (err) {
            if (err.response?.data) {
                setError(err.response.data.error || 'Не удалось изменить пароль');
            } else {
                setError('Ошибка сервера');
            }
        }
    };

    const handleRoleChange = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const response = await axios.post(
                'http://localhost:8000/api/students/change_role/',
                {
                    role: formData.role,
                    password: formData.currentPassword
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );

            setSuccess('Роль успешно изменена');
            setFormData(prev => ({
                ...prev,
                currentPassword: ''
            }));
            fetchUserData(); // Обновляем данные пользователя
        } catch (err) {
            if (err.response?.data) {
                setError(err.response.data.error || 'Не удалось изменить роль');
            } else {
                setError('Ошибка сервера');
            }
        }
    };

    if (loading) return <div className="loading">Загрузка профиля...</div>;
    if (!user) return <div className="error">Пользователь не найден</div>;

    return (
        <div className="profile-container">
            <h1>Личный кабинет</h1>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="profile-info">
                <h2>Информация о пользователе</h2>
                <p><strong>ФИО:</strong> {user.full_name}</p>
                <p><strong>Email:</strong> {user.username}</p>
                <p><strong>Роль:</strong> {user.role === 'TEACHER' ? 'Преподаватель' : 'Студент'}</p>
            </div>

            <div className="profile-sections">
                <section className="profile-section">
                    <h2>Изменение email</h2>
                    <form onSubmit={handleEmailChange}>
                        <div className="form-group">
                            <label htmlFor="email">Новый email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="currentPassword">Текущий пароль:</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-button">
                            Изменить email
                        </button>
                    </form>
                </section>

                <section className="profile-section">
                    <h2>Изменение пароля</h2>
                    <form onSubmit={handlePasswordChange}>
                        <div className="form-group">
                            <label htmlFor="currentPassword">Текущий пароль:</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword">Новый пароль:</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Подтвердите пароль:</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-button">
                            Изменить пароль
                        </button>
                    </form>
                </section>

                <section className="profile-section">
                    <h2>Изменение роли</h2>
                    <form onSubmit={handleRoleChange}>
                        <div className="form-group">
                            <label htmlFor="role">Роль:</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="STUDENT">Студент</option>
                                <option value="TEACHER">Преподаватель</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="currentPassword">Текущий пароль:</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-button">
                            Изменить роль
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default Profile; 