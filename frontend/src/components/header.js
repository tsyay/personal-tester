import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, FileText, User, LogIn } from 'lucide-react';
import axios from 'axios';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.get('http://localhost:8000/api/students/me/', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(response => {
        setUser(response.data);
      }).catch(() => {
        localStorage.removeItem('access_token');
        setUser(null);
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    navigate('/login');
  };

  const canAccessUsersManagement = user && (user.role === 'ADMIN' || user.role === 'TEACHER');

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <BookOpen className="h-6 w-6" />
          <span>Обучение</span>
        </Link>

        <nav className="header-nav">
          <Link to="/" className={`header-link ${location.pathname === '/' ? 'active' : ''}`}>
            <Home className="h-5 w-5" />
            <span>Главная</span>
          </Link>
          <Link to="/tests" className={`header-link ${location.pathname === '/tests' ? 'active' : ''}`}>
            <FileText className="h-5 w-5" />
            <span>Тесты</span>
          </Link>
          <Link to="/articles" className={`header-link ${location.pathname === '/articles' ? 'active' : ''}`}>
            <FileText className="h-5 w-5" />
            <span>Статьи</span>
          </Link>
          <Link to="/courses" className={`header-link ${location.pathname === '/courses' ? 'active' : ''}`}>
            <BookOpen className="h-5 w-5" />
            <span>Курсы</span>
          </Link>
          {canAccessUsersManagement && (
            <Link to="/users" className={`header-link ${location.pathname === '/users' ? 'active' : ''}`}>
              <FileText className="h-5 w-5" />
              <span>Пользователи</span>
            </Link>
          )}
          <Link to="/profile" className={`header-link ${location.pathname === '/profile' ? 'active' : ''}`}>
            <User className="h-5 w-5" />
            <span>Профиль</span>
          </Link>
        </nav>

        <div className="header-auth">
          {user ? (
            <button onClick={handleLogout} className="header-link">
              Выйти
            </button>
          ) : (
            <Link to="/login" className="header-link">
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
