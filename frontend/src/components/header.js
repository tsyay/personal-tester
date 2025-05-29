import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-content">
                <Link to="/" className="logo">
                    Personal Tester
                </Link>
                <nav className="nav-links">
                    {user ? (
                        <>
                            <Link to="/dashboard">Панель управления</Link>
                            <Link to="/tests">Тесты</Link>
                            <Link to="/articles">Статьи</Link>
                            {user.role === 'TEACHER' && (
                                <>
                                    <Link to="/tests/create">Создать тест</Link>
                                    <Link to="/articles/create">Создать статью</Link>
                                    <Link to="/users">Пользователи</Link>
                                </>
                            )}
                            <Link to="/profile">Личный кабинет</Link>
                            <button onClick={handleLogout} className="logout-button">
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Войти</Link>
                            <Link to="/register">Регистрация</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
