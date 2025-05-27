import React from 'react';
import '../styles/header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>SkillSense</h1>
        </div>
        <nav className="nav">
          <ul className="nav-list">
            <li><a href="/" className="nav-link">Главная</a></li>
            <li><a href="/about" className="nav-link">О нас</a></li>
            <li><a href="/services" className="nav-link">Услуги</a></li>
            <li><a href="/contact" className="nav-link">Контакты</a></li>
            <li><a href="/analyzer" className="nav-link">Анализ</a></li>
          </ul>
        </nav>
        <div className="auth-actions">
            <a className="auth-link" href="/signin"> Войти </a>
            <a className="auth-link gradient-link" href="/signup"> Попрбовать бесплатно </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
