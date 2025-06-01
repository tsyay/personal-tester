import React, { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle, Award, Trash2, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Tests.css';

// Компонент для отображения информации о тесте
const TestInfo = ({ test }) => (
  <div className="test-info">
    <div className="test-meta">
      <div className="test-meta-item">
        <Clock className="h-4 w-4" />
        <span>{test.time_limit} мин</span>
      </div>
      <div className="test-meta-item">
        <Users className="h-4 w-4" />
        <span>{test.questions?.length || 0} вопросов</span>
      </div>
    </div>
    <div className="test-status">
      <span className={`test-badge ${test.status === 'completed' ? 'badge-primary' : 'badge-amber'}`}>
        {test.status === 'completed' ? 'Пройден' : 'Доступен'}
      </span>
      {test.status === 'completed' && (
        <div className="test-completed">
          <CheckCircle className="h-4 w-4" />
          <span>Пройден</span>
        </div>
      )}
    </div>
  </div>
);

// Компонент карточки теста
const TestCard = ({ test, onDelete, canDelete }) => (
  <div className="test-card">
    <div className="test-card-header">
      <div className="test-header-content">
        <div className="test-icon">
          <Award className="h-5 w-5" />
        </div>
        <div className="test-header-info">
          <h3 className="test-title">{test.title}</h3>
          <TestInfo test={test} />
        </div>
      </div>
    </div>

    <div className="test-card-footer">
      <div className="test-actions">
        <Link 
          to={`/tests/${test.id}/take`}
          className="start-test-button"
        >
          {test.status === 'completed' ? 'Повторить тест' : 'Начать тест'}
        </Link>
        {canDelete && (
          <button
            onClick={() => onDelete(test.id)}
            className="delete-test-button"
            title="Удалить тест"
          >
            <Trash2 className="h-4 w-4" />
            Удалить
          </button>
        )}
      </div>
    </div>
  </div>
);

// Основной компонент страницы тестов
const Tests = () => {
  const [tests, setTests] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchData(token);
  }, [navigate]);

  // Функция загрузки данных
  const fetchData = async (token) => {
    try {
      setLoading(true);

      const [userResponse, testsResponse] = await Promise.all([
        axios.get('/api/students/me/', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/tests/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setUser(userResponse.data);
      setTests(testsResponse.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('Ошибка при загрузке данных');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик удаления теста
  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот тест?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`/api/tests/${testId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setTests(tests.filter(test => test.id !== testId));
    } catch (err) {
      console.error('Error deleting test:', err);
      setError('Ошибка при удалении теста');
    }
  };

  // Проверка прав доступа
  const canCreateTest = user && (user.role === 'TEACHER' || user.role === 'ADMIN');
  const canDeleteTest = user && (user.role === 'TEACHER' || user.role === 'ADMIN');

  // Состояние загрузки
  if (loading) {
    return (
      <div className="tests-container">
        <div className="loading-container">Загрузка...</div>
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className="tests-container">
        <div className="error-container">{error}</div>
      </div>
    );
  }

  return (
    <div className="tests-container">
      <div className="tests-header">
        <div className="header-content">
          <h1>Тесты и оценки</h1>
          <p className="header-description">
            Выберите тест для прохождения или создайте новый
          </p>
        </div>
        {canCreateTest && (
          <button 
            className="create-test-button"
            onClick={() => navigate('/tests/create')}
          >
            <Plus className="h-5 w-5" />
            Создать тест
          </button>
        )}
      </div>

      <section className="tests-section">
        <h2 className="section-title">Доступные тесты</h2>
        <div className="tests-grid">
          {tests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              onDelete={handleDeleteTest}
              canDelete={canDeleteTest}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Tests; 