import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, FileText, Clock, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import '../styles/Courses.css';

const CourseCard = ({ course, onDelete, canDelete }) => (
  <div className="course-card">
    <div className="course-card-header">
      <div className="course-header-content">
        <div className="course-icon">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="course-header-info">
          <h3 className="course-title">{course.title}</h3>
          <div className="course-info">
            <div className="course-meta">
              <div className="course-meta-item">
                <FileText className="h-4 w-4" />
                <span>{course.articles.length} статей</span>
              </div>
              <div className="course-meta-item">
                <Clock className="h-4 w-4" />
                <span>{course.tests.length} тестов</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="course-card-footer">
      <div className="course-actions">
        <Link 
          to={`/courses/${course.id}`}
          className="view-course-button"
        >
          Открыть курс
        </Link>
        {canDelete && (
          <button
            onClick={() => onDelete(course.id)}
            className="delete-course-button"
            title="Удалить курс"
          >
            <Trash2 className="h-4 w-4" />
            Удалить
          </button>
        )}
      </div>
    </div>
  </div>
);

const Courses = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserAndCourses();
  }, []);

  const fetchUserAndCourses = async () => {
    try {
      setLoading(true);
      const [userResponse, coursesResponse] = await Promise.all([
        axios.get('http://localhost:8000/api/students/me/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }),
        axios.get('http://localhost:8000/api/courses/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        })
      ]);
      setUser(userResponse.data);
      setCourses(coursesResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот курс?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/courses/${courseId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      setCourses(courses.filter(course => course.id !== courseId));
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Ошибка при удалении курса');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canCreateCourse = user && (user.role === 'TEACHER' || user.role === 'ADMIN');
  const canDeleteCourse = user && (user.role === 'TEACHER' || user.role === 'ADMIN');

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
        <div className="header-content">
          <h1>Курсы</h1>
          <p className="header-description">
            Выберите курс для изучения или создайте новый
          </p>
        </div>
        {canCreateCourse && (
          <button 
            onClick={() => navigate('/courses/create')}
            className="create-course-button"
          >
            <Plus className="h-5 w-5" />
            Создать курс
          </button>
        )}
      </div>

      <section className="courses-section">
        <h2 className="section-title">Доступные курсы</h2>
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onDelete={handleDeleteCourse}
              canDelete={canDeleteCourse}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Courses; 