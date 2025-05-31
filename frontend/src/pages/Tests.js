import React, { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Tests.css';

const TestCard = ({ test }) => (
  <div className="test-card">
    <div className="test-card-header">
      <div className="flex items-start gap-3">
        <div className="test-icon">
          <Award className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="test-title mb-2">{test.title}</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{test.time_limit} мин</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{test.questions?.length || 0} вопросов</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="test-card-content">
      <div className="flex items-center justify-between">
        <span className={`test-difficulty ${
          test.difficulty === 'easy' ? 'easy' :
          test.difficulty === 'medium' ? 'medium' :
          'hard'
        }`}>
          {test.difficulty === 'easy' ? 'Легкий' :
           test.difficulty === 'medium' ? 'Средний' :
           'Сложный'}
        </span>
        <span className={`test-badge ${test.status === 'completed' ? 'badge-primary' : 'badge-amber'}`}>
          {test.status === 'completed' ? 'Пройден' : 'Доступен'}
        </span>
      </div>
      {test.status === 'completed' && (
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
          <CheckCircle className="h-4 w-4" />
          <span>Пройден</span>
        </div>
      )}
    </div>

    <div className="test-card-footer">
      <Link 
        to={`/tests/${test.id}/take`}
        className="start-test-button"
      >
        {test.status === 'completed' ? 'Повторить тест' : 'Начать тест'}
      </Link>
    </div>
  </div>
);

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const userResponse = await axios.get('/api/students/me/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUser(userResponse.data);

        const testsResponse = await axios.get('/api/tests/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
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

    fetchData();
  }, [navigate]);

  const canCreateTest = user && (user.role === 'TEACHER' || user.role === 'ADMIN');

  if (loading) {
    return (
      <div className="tests-container">
        <div className="loading-container">Загрузка...</div>
      </div>
    );
  }

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
        <h1>Тесты и оценки</h1>
        {canCreateTest && (
          <button 
            className="create-test-button"
            onClick={() => navigate('/tests/create')}
          >
            Создать тест
          </button>
        )}
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Доступные тесты</h2>
        <div className="tests-grid">
          {tests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Tests; 