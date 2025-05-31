import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Clock, Users } from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const [stats, setStats] = useState({
    availableTests: 0,
    completionRate: 0,
    availableCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const [testsResponse, coursesResponse, userResponse] = await Promise.all([
          axios.get('/api/tests/', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get('/api/courses/', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get('/api/students/me/', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const tests = testsResponse.data;
        const courses = coursesResponse.data;
        const completedTests = tests.filter(test => test.status === 'completed').length;
        const completionRate = tests.length > 0 ? Math.round((completedTests / tests.length) * 100) : 0;

        setStats({
          availableTests: tests.length,
          completionRate,
          availableCourses: courses.length
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Ошибка при загрузке данных');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="container py-12 text-center">Загрузка...</div>;
  }

  if (error) {
    return <div className="container py-12 text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Добро пожаловать в Обучение ресторана</h1>
          <p className="text-xl mb-8">Развивайте свои навыки и продвигайтесь по карьерной лестнице</p>
          <Link to="/learning" className="btn btn-primary">
            Начать обучение
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <BookOpen className="icon text-primary-500" />
                <div>
                  <h3 className="text-2xl font-bold">{stats.availableTests}</h3>
                  <p className="text-gray-600">Доступных тестов</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <Award className="icon text-amber-500" />
                <div>
                  <h3 className="text-2xl font-bold">{stats.completionRate}%</h3>
                  <p className="text-gray-600">Процент завершения</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <BookOpen className="icon text-primary-500" />
                <div>
                  <h3 className="text-2xl font-bold">{stats.availableCourses}</h3>
                  <p className="text-gray-600">Доступных курсов</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 