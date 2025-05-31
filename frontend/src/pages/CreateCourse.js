import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, GripVertical } from 'lucide-react';
import axios from 'axios';
import '../styles/CreateCourse.css';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [articles, setArticles] = useState([]);
  const [tests, setTests] = useState([]);
  const [availableArticles, setAvailableArticles] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAvailableContent();
  }, []);

  const fetchAvailableContent = async () => {
    try {
      setLoading(true);
      const [articlesRes, testsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/articles/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        }),
        axios.get('http://localhost:8000/api/tests/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        })
      ]);
      setAvailableArticles(articlesRes.data);
      setAvailableTests(testsRes.data);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Не удалось загрузить контент');
    } finally {
      setLoading(false);
    }
  };

  const handleAddArticle = (article) => {
    setArticles([...articles, { ...article, type: 'article' }]);
    setAvailableArticles(availableArticles.filter(a => a.id !== article.id));
  };

  const handleAddTest = (test) => {
    setTests([...tests, { ...test, type: 'test' }]);
    setAvailableTests(availableTests.filter(t => t.id !== test.id));
  };

  const handleRemoveItem = (item) => {
    if (item.type === 'article') {
      setArticles(articles.filter(a => a.id !== item.id));
      setAvailableArticles([...availableArticles, item]);
    } else {
      setTests(tests.filter(t => t.id !== item.id));
      setAvailableTests([...availableTests, item]);
    }
  };

  const handleMoveItem = (index, direction) => {
    const items = [...articles, ...tests];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

    const newArticles = newItems.filter(item => item.type === 'article');
    const newTests = newItems.filter(item => item.type === 'test');

    setArticles(newArticles);
    setTests(newTests);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Creating course with data:', {
        title,
        articles: articles.map(a => a.id),
        tests: tests.map(t => t.id),
        content_order: [...articles, ...tests].map(item => ({
          id: item.id,
          type: item.type
        }))
      });

      // Сначала создаем курс
      const courseResponse = await axios.post('http://localhost:8000/api/courses/', {
        title,
        content_order: [...articles, ...tests].map(item => ({
          id: item.id,
          type: item.type
        }))
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });

      console.log('Course created:', courseResponse.data);

      // Добавляем статьи в курс
      for (const article of articles) {
        console.log('Adding article to course:', article.id);
        await axios.post(`http://localhost:8000/api/courses/${courseResponse.data.id}/add_article/`, {
          article_id: article.id
        }, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        });
      }

      // Добавляем тесты в курс
      for (const test of tests) {
        console.log('Adding test to course:', test.id);
        await axios.post(`http://localhost:8000/api/courses/${courseResponse.data.id}/add_test/`, {
          test_id: test.id
        }, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        });
      }

      console.log('Course creation completed successfully');
      navigate('/courses');
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Не удалось создать курс');
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="create-course-container">
      <div className="create-course-header">
        <button onClick={() => navigate('/courses')} className="back-button">
          <ArrowLeft className="h-5 w-5" />
          Назад к курсам
        </button>
        <h1>Создание курса</h1>
      </div>

      <form onSubmit={handleSubmit} className="create-course-form">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="title">Название курса</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание курса</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
            />
          </div>
        </div>

        <div className="content-section">
          <div className="available-content">
            <div className="content-column">
              <h3>Доступные статьи</h3>
              <div className="content-list">
                {availableArticles.map(article => (
                  <div key={article.id} className="content-item">
                    <span>{article.title}</span>
                    <button
                      type="button"
                      onClick={() => handleAddArticle(article)}
                      className="add-button"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="content-column">
              <h3>Доступные тесты</h3>
              <div className="content-list">
                {availableTests.map(test => (
                  <div key={test.id} className="content-item">
                    <span>{test.title}</span>
                    <button
                      type="button"
                      onClick={() => handleAddTest(test)}
                      className="add-button"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="selected-content">
            <h3>Порядок материалов</h3>
            <div className="content-list">
              {[...articles, ...tests].map((item, index) => (
                <div key={`${item.type}-${item.id}`} className="content-item">
                  <GripVertical className="h-4 w-4 drag-handle" />
                  <span>{item.title}</span>
                  <div className="item-actions">
                    <button
                      type="button"
                      onClick={() => handleMoveItem(index, -1)}
                      disabled={index === 0}
                      className="move-button"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveItem(index, 1)}
                      disabled={index === articles.length + tests.length - 1}
                      className="move-button"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item)}
                      className="remove-button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Создать курс
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse; 