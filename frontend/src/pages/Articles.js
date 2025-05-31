import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, Clock, User, FileText } from 'lucide-react';
import axios from 'axios';
import '../styles/Articles.css';

const ArticleCard = ({ article }) => {
  const navigate = useNavigate();

  const handleReadArticle = () => {
    navigate(`/articles/${article.id}`);
  };

  return (
    <div className="article-card">
      <div className="article-card-header">
        <div className="flex items-start gap-3">
          <div className="article-icon">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="article-title">{article.title}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>{article.creator.full_name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{new Date(article.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="article-card-content">
        <div className="flex items-center justify-between">
          <span className="article-pages">
            <FileText className="h-4 w-4 inline-block mr-1" />
            {article.total_pages} страниц
          </span>
          {!article.is_published && (
            <span className="article-badge badge-draft">
              Черновик
            </span>
          )}
        </div>
        <p className="article-description mt-2">{article.description}</p>
      </div>

      <div className="article-card-footer">
        <button 
          onClick={handleReadArticle}
          className="read-article-button"
        >
          Читать статью
        </button>
      </div>
    </div>
  );
};

const Articles = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statuses = [
    { id: 'all', name: 'Все статьи' },
    { id: 'published', name: 'Опубликованные' },
    { id: 'draft', name: 'Черновики' },
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/articles/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        if (Array.isArray(response.data)) {
          setArticles(response.data);
        } else {
          setError('Неверный формат данных статей');
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Не удалось загрузить статьи');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'published' && article.is_published) ||
                         (selectedStatus === 'draft' && !article.is_published);
    return matchesSearch && matchesStatus;
  });

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
        <h1>Статьи</h1>
        <Link 
          to="/articles/create"
          className="create-article-button"
        >
          Создать статью
        </Link>
      </div>

      <div className="search-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Поиск статей..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="search-icon" />
        </div>
        <select
          className="filter-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          {statuses.map(status => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Доступные статьи</h2>
        <div className="articles-grid">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Articles; 