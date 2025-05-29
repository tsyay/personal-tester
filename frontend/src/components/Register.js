import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        password2: '',
        full_name: '',
        role: 'STUDENT'
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

        if (formData.password !== formData.password2) {
            setError('Пароли не совпадают');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:8000/api/students/register/',
                {
                    username: formData.username,
                    password: formData.password,
                    password2: formData.password2,
                    full_name: formData.full_name,
                    role: formData.role
                }
            );

            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
            
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
                <h2>Регистрация</h2>
                
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="full_name">ФИО</label>
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                    />
                </div>

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
                        minLength="8"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password2">Подтвердите пароль</label>
                    <input
                        type="password"
                        id="password2"
                        name="password2"
                        value={formData.password2}
                        onChange={handleChange}
                        required
                        minLength="8"
                    />
                </div>

                <button 
                    type="submit" 
                    className="auth-button"
                    disabled={loading}
                >
                    {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>

                <Link to="/login" className="auth-link">
                    Уже есть аккаунт? Войти
                </Link>
            </form>
        </div>
    );
};

export default Register;