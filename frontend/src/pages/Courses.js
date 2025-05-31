import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, FileText, Clock, Plus } from 'lucide-react';
import axios from 'axios';
import '../styles/Courses.css';

const CourseCard = ({ course }) => (
  <div className="course-card">
    <div className="course-card-header">
      <div className="flex items-start gap-3">
        <div className="course-icon">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="course-title">{course.title}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span>{course.articles.length} статей</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{course.tests.length} тестов</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="course-card-content">
      <div className="course-stats">
        <div className="stat-item">
          <span className="stat-label">Статьи:</span>
          <span className="stat-value">{course.articles.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Тесты:</span>
          <span className="stat-value">{course.tests.length}</span>
        </div>
      </div>
    </div>

    <div className="course-card-footer">
      <Link 
        to={`/courses/${course.id}`}
        className="view-course-button"
      >
        Открыть курс
      </Link>
    </div>
  </div>
);

const Courses = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/courses/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Не удалось загрузить курсы');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="courses-container">
        <div className="loading-container">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-container">
        <div className="error-container">{error}</div>
      </div>
    );
  }

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h1>Курсы</h1>
        <button 
          onClick={() => navigate('/courses/create')}
          className="create-course-button"
        >
          <Plus className="h-5 w-5" />
          Создать курс
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Поиск курсов..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="search-icon" />
      </div>

      <section>
        <h2 className="section-title">Доступные курсы</h2>
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Courses; 