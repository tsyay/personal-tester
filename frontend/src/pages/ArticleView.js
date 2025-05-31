import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import '../styles/ArticleView.css';

const ArticleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        setError('ID статьи не указан');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`http://localhost:8000/api/articles/${id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setArticle(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching article:', err);
        if (err.response) {
          setError(`Ошибка при загрузке статьи: ${err.response.data.error || err.response.statusText}`);
        } else {
          setError('Ошибка при загрузке статьи');
        }
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const updateProgress = async (pageNumber) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `http://localhost:8000/api/articles/${id}/update_progress/`,
        { page_number: pageNumber },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= article.total_pages) {
      setCurrentPage(newPage);
      updateProgress(newPage);
    }
  };

  if (loading) {
    return (
      <div className="article-view-container">
        <div className="loading-container">Загрузка статьи...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="article-view-container">
        <div className="error-container">{error}</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-view-container">
        <div className="error-container">Статья не найдена</div>
      </div>
    );
  }

  const currentPageData = article.pages.find(page => page.page_number === currentPage);

  return (
    <div className="article-view-container">
      <div className="article-header">
        <h1>{article.title}</h1>
        <div className="article-meta">
          <span className="article-author">Автор: {article.creator.full_name}</span>
          <span className="article-date">
            {new Date(article.created_at).toLocaleDateString()}
          </span>
        </div>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${article.progress?.progress_percentage || 0}%` }}
            />
          </div>
          <span className="progress-text">
            Прогресс: {article.progress?.progress_percentage || 0}%
          </span>
        </div>
      </div>

      {currentPageData && (
        <div className="page-content">
          <h2>{currentPageData.title}</h2>
          {currentPageData.image && (
            <img 
              src={currentPageData.image} 
              alt={currentPageData.title}
              className="page-image"
            />
          )}
          <div className="page-text">
            {currentPageData.content}
          </div>
        </div>
      )}

      <div className="navigation-buttons">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="nav-button prev-button"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Предыдущая страница</span>
        </button>
        <span className="page-indicator">
          Страница {currentPage} из {article.total_pages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === article.total_pages}
          className="nav-button next-button"
        >
          <span>Следующая страница</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ArticleView; 