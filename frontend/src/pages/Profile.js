import React, { useState, useEffect } from 'react';
import { User, Calendar, Award, BookOpen, Clock, Star, ChevronRight } from 'lucide-react';
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
    confirmPassword: ''
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

      console.log('User data:', response.data);
      setUser(response.data);
      setFormData(prev => ({
        ...prev,
        email: response.data.email
      }));
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Не удалось загрузить данные пользователя');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = (role) => {
    console.log('Role:', role);
    switch (role) {
      case 'ADMIN':
        return 'Администратор';
      case 'TEACHER':
        return 'Преподаватель';
      case 'STUDENT':
        return 'Студент';
      default:
        return role;
    }
  };

  const getPositionDisplay = (position) => {
    console.log('Position:', position);
    switch (position) {
      case 'WAITER':
        return 'Официант';
      case 'BARTENDER':
        return 'Бармен';
      case 'MANAGER':
        return 'Менеджер';
      case 'CLEANER':
        return 'Уборщик';
      case 'COOK':
        return 'Повар';
      default:
        return 'Не указана';
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
      fetchUserData();
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

  if (loading) return <div className="loading">Загрузка профиля...</div>;
  if (!user) return <div className="error">Пользователь не найден</div>;

  return (
    <div className="profile-container">
      <div className="max-w-6xl mx-auto px-4">
        {/* Основная карточка профиля */}
        <div className="profile-card">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Левая часть - информация о сотруднике */}
            <div className="flex items-start gap-4">
              <div className="profile-avatar">
                <User className="h-8 w-8 text-gray-800" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                <p className="text-gray-600">{getRoleDisplay(user.role)}</p>
                <p className="text-gray-600">{getPositionDisplay(user.position)}</p>
              </div>
            </div>

            {/* Правая часть - рейтинг */}
            <div className="flex items-center md:ml-auto">
              <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-lg">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="ml-2 font-medium text-yellow-800">Средний балл: 4.7</span>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Форма изменения email */}
        <div className="profile-card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Изменение email</h2>
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
                className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
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
                className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              />
            </div>
            <button type="submit" className="submit-button bg-gray-800 hover:bg-gray-900">
              Изменить email
            </button>
          </form>
        </div>

        {/* Форма изменения пароля */}
        <div className="profile-card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Изменение пароля</h2>
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
                className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
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
                className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
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
                className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              />
            </div>
            <button type="submit" className="submit-button bg-gray-800 hover:bg-gray-900">
              Изменить пароль
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Компонент карточки статистики
const StatCard = ({ value, label, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-gray-600 bg-gray-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    yellow: 'text-yellow-600 bg-yellow-50'
  };

  return (
    <div className="stat-card">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
        <div className={`stat-icon ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

// Компонент строки прогресса
const ProgressItem = ({ name, progress, color }) => {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-700">{name}</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <div className="progress-bar">
        <div 
          className={`progress-bar-fill ${color}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Profile;