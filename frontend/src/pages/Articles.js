import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, Clock, User, FileText, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import '../styles/Articles.css';

const ArticleCard = ({ article, onDelete, canDelete }) => {
  const navigate = useNavigate();

  const handleReadArticle = () => {
    navigate(`/articles/${article.id}`);
  };

  return (
    <div className="article-card">
      <div className="article-card-header">
        <div className="article-header-content">
          <div className="article-icon">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="article-header-info">
            <h3 className="article-title">{article.title}</h3>
            <div className="article-info">
              <div className="article-meta">
                <div className="article-meta-item">
                  <User className="h-4 w-4" />
                  <span>{article.creator.full_name}</span>
                </div>
                <div className="article-meta-item">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(article.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="article-card-content">
        <p className="article-description mt-2">{article.description}</p>
      </div>

      <div className="article-card-footer">
        <div className="article-actions">
          <button 
            onClick={handleReadArticle}
            className="read-article-button"
          >
            Читать статью
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(article.id)}
              className="delete-article-button"
              title="Удалить статью"
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Articles = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const statuses = [
    { id: 'all', name: 'Все статьи' },
    { id: 'published', name: 'Опубликованные' },
    { id: 'draft', name: 'Черновики' },
  ];

  useEffect(() => {
    const fetchUserAndArticles = async () => {
      try {
        setLoading(true);
        const [userResponse, articlesResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/students/me/', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }),
          axios.get('http://localhost:8000/api/articles/', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          })
        ]);
        
        setUser(userResponse.data);
        if (Array.isArray(articlesResponse.data)) {
          setArticles(articlesResponse.data);
        } else {
          setError('Неверный формат данных статей');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndArticles();
  }, []);

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/articles/${articleId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      setArticles(articles.filter(article => article.id !== articleId));
    } catch (err) {
      console.error('Error deleting article:', err);
      setError('Ошибка при удалении статьи');
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'published' && article.is_published) ||
                         (selectedStatus === 'draft' && !article.is_published);
    return matchesSearch && matchesStatus;
  });

  const canCreateArticle = user && (user.role === 'TEACHER' || user.role === 'ADMIN');
  const canDeleteArticle = user && (user.role === 'TEACHER' || user.role === 'ADMIN');

  if (loading) {
    return (
      <div className="articles-container">
        <div className="loading-container">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="articles-container">
        <div className="error-container">{error}</div>
      </div>
    );
  }

  return (
    <div className="articles-container">
      <div className="articles-header">
        <div className="header-content">
          <h1>Статьи</h1>
          <p className="header-description">
            Выберите статью для чтения или создайте новую
          </p>
        </div>
        {canCreateArticle && (
          <button 
            onClick={() => navigate('/articles/create')}
            className="create-article-button"
          >
            <Plus className="h-5 w-5" />
            Создать статью
          </button>
        )}
      </div>

      <section className="articles-section">
        <h2 className="section-title">Доступные статьи</h2>
        <div className="articles-grid">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onDelete={handleDeleteArticle}
              canDelete={canDeleteArticle}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Articles; 