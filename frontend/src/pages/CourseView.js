import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText, Clock, ChevronRight } from 'lucide-react';
import axios from 'axios';
import '../styles/CourseView.css';

const CourseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/courses/${id}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      console.log('Fetched course data:', response.data);
      
      // Добавляем content_order по умолчанию, если его нет
      const courseData = {
        ...response.data,
        content_order: response.data.content_order || [],
        articles: response.data.articles || [],
        tests: response.data.tests || []
      };
      console.log('Processed course data:', courseData);
      setCourse(courseData);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Не удалось загрузить курс');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="course-view-container">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-view-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-view-container">
        <div className="error">Курс не найден</div>
      </div>
    );
  }

  return (
    <div className="course-view-container">
      <div className="course-header">
        <button onClick={() => navigate('/courses')} className="back-button">
          <ArrowLeft className="h-5 w-5" />
          Назад к курсам
        </button>
        <div className="course-title-section">
          <div className="course-icon">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1>{course.title}</h1>
            <div className="course-stats">
              <div className="stat-item">
                <FileText className="h-4 w-4" />
                <span>{course.articles?.length || 0} статей</span>
              </div>
              <div className="stat-item">
                <Clock className="h-4 w-4" />
                <span>{course.tests?.length || 0} тестов</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {course.description && (
        <div className="course-description">
          <p>{course.description}</p>
        </div>
      )}

      <div className="course-content">
        <h2>Содержание курса</h2>
        <div className="content-list">
          {course.articles?.length > 0 || course.tests?.length > 0 ? (
            <>
              {course.articles?.map(article => (
                <div key={`article-${article.id}`} className="content-item">
                  <div className="content-item-info">
                    <div className="content-item-icon">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="content-item-details">
                      <span className="content-item-title">{article.title}</span>
                      <span className="content-item-type">Статья</span>
                    </div>
                  </div>
                  <Link 
                    to={`/articles/${article.id}`}
                    className="content-item-link"
                  >
                    Открыть
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
              {course.tests?.map(test => (
                <div key={`test-${test.id}`} className="content-item">
                  <div className="content-item-info">
                    <div className="content-item-icon">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="content-item-details">
                      <span className="content-item-title">{test.title}</span>
                      <span className="content-item-type">Тест</span>
                    </div>
                  </div>
                  <Link 
                    to={`/tests/${test.id}/take`}
                    className="content-item-link"
                  >
                    Открыть
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </>
          ) : (
            <div className="empty-content">
              В курсе пока нет материалов
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseView; 