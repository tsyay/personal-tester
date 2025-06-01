import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Copy, Check } from 'lucide-react';
import axios from 'axios';
import '../styles/UserCreate.css';

const UserCreate = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        position: 'WAITER'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [userData, setUserData] = useState(null);
    const [copied, setCopied] = useState(false);

    const generatePassword = () => {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        setUserData(null);

        try {
            const password = generatePassword();
            const response = await axios.post('http://localhost:8000/api/students/register/', {
                ...formData,
                username: formData.email,
                password: password,
                password2: password,
                role: 'STUDENT'
            });

            const userInfo = {
                full_name: response.data.user.full_name,
                email: response.data.user.username,
                password: password
            };

            setUserData(userInfo);
            setSuccess('Пользователь успешно создан!');
            
            // Копируем данные в буфер обмена
            const clipboardText = `ФИО: ${userInfo.full_name}\nEmail: ${userInfo.email}\nПароль: ${userInfo.password}`;
            await navigator.clipboard.writeText(clipboardText);
            setCopied(true);
            
            // Сбрасываем форму
            setFormData({
                full_name: '',
                email: '',
                position: 'WAITER'
            });

            // Сбрасываем статус копирования через 3 секунды
            setTimeout(() => {
                setCopied(false);
            }, 3000);

        } catch (err) {
            console.error('Registration error:', err.response?.data);
            setError(err.response?.data?.error || 'Ошибка при создании пользователя');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-create-container">
            <div className="user-create-card">
                <div className="user-create-header">
                    <UserPlus className="header-icon" />
                    <h1>Создание пользователя</h1>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="user-create-form">
                    <div className="form-group">
                        <label htmlFor="full_name">ФИО</label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                            placeholder="Введите ФИО"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Введите email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="position">Должность</label>
                        <select
                            id="position"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            required
                            className="position-select"
                        >
                            <option value="WAITER">Официант</option>
                            <option value="BARTENDER">Бармен</option>
                            <option value="MANAGER">Менеджер</option>
                            <option value="CLEANER">Уборщик</option>
                            <option value="COOK">Повар</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Создание...' : 'Создать пользователя'}
                    </button>
                </form>

                {userData && (
                    <div className="user-data-card">
                        <h2>Данные пользователя</h2>
                        <div className="user-data-content">
                            <p><strong>ФИО:</strong> {userData.full_name}</p>
                            <p><strong>Email:</strong> {userData.email}</p>
                            <p><strong>Пароль:</strong> {userData.password}</p>
                        </div>
                        <div className="copy-status">
                            {copied ? (
                                <span className="copied-message">
                                    <Check className="check-icon" />
                                    Скопировано в буфер обмена
                                </span>
                            ) : (
                                <span className="copy-message">
                                    <Copy className="copy-icon" />
                                    Данные скопированы в буфер обмена
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserCreate; 