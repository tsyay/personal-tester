import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import '../styles/Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const { updateUser } = useUser();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Сначала получаем токены
            const authResponse = await axios.post(
                'http://localhost:8000/api/students/login/',
                {
                    username: formData.username,
                    password: formData.password
                }
            );

            const { access, refresh, user } = authResponse.data;

            // Сохраняем токены
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // Получаем полные данные пользователя
            const userResponse = await axios.get('http://localhost:8000/api/students/me/', {
                headers: {
                    'Authorization': `Bearer ${access}`
                }
            });

            // Обновляем состояние пользователя через контекст
            updateUser(userResponse.data);

            // Устанавливаем заголовок авторизации по умолчанию
            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

            navigate('/');
        } catch (err) {
            if (err.response?.data) {
                const data = err.response.data;
                if (data.password) {
                    setError(data.password[0]);
                } else if (data.username) {
                    setError(data.username[0]);
                } else if (typeof data === 'object') {
                    const firstErrorKey = Object.keys(data)[0];
                    const firstError = data[firstErrorKey];
                    setError(Array.isArray(firstError) ? firstError[0] : firstError);
                } else {
                    setError(data.toString());
                }
            } else {
                setError(err.message || 'Ошибка сервера');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Вход в систему</h2>
                    <p>Войдите в свой аккаунт для доступа к тестам</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="error-message">
                            <AlertCircle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username">Имя пользователя</label>
                        <div className="input-wrapper">
                            <User className="input-icon" />
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="input"
                                placeholder="Введите имя пользователя"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="input"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <LogIn className="h-5 w-5" />
                                <span>Войти</span>
                            </>
                        )}
                    </button>

                    <Link to="/register" className="register-link">
                        Нет аккаунта? Зарегистрироваться
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default Login; 