import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

const Login = () => {
    const navigate = useNavigate();
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

            console.log('User data from server:', userResponse.data);

            // Сохраняем данные пользователя
            localStorage.setItem('user', JSON.stringify(userResponse.data));

            console.log('Saved user data:', JSON.parse(localStorage.getItem('user')));

            // Устанавливаем заголовок авторизации по умолчанию
            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

            navigate('/dashboard');
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
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Вход в систему</h2>
                
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="username">Имя пользователя</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Пароль</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    className="auth-button"
                    disabled={loading}
                >
                    {loading ? 'Вход...' : 'Войти'}
                </button>

                <Link to="/register" className="auth-link">
                    Нет аккаунта? Зарегистрироваться
                </Link>
            </form>
        </div>
    );
};

export default Login; 