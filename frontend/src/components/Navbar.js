import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, FileText, User } from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <BookOpen className="h-6 w-6" />
          <span>Обучение</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="navbar-link">
            <Home className="h-5 w-5" />
            <span>Главная</span>
          </Link>
          <Link to="/tests" className="navbar-link">
            <FileText className="h-5 w-5" />
            <span>Тесты</span>
          </Link>
          <Link to="/articles" className="navbar-link">
            <FileText className="h-5 w-5" />
            <span>Статьи</span>
          </Link>
          <Link to="/profile" className="navbar-link">
            <User className="h-5 w-5" />
            <span>Профиль</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 