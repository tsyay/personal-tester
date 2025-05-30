import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/ArticleView.css';

const ArticleView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [article, setArticle] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('ArticleView mounted');
        console.log('Current location:', location);
        console.log('Raw id from URL:', id);
        console.log('id type:', typeof id);

        const fetchArticle = async () => {
            if (!id) {
                console.error('No article ID provided');
                setError('ID статьи не указан');
                setLoading(false);
                return;
            }

            const numericId = parseInt(id);
            if (isNaN(numericId)) {
                console.error('Invalid article ID format:', id);
                setError('Неверный формат ID статьи');
                setLoading(false);
                return;
            }

            console.log('Fetching article with numeric ID:', numericId);

            try {
                const token = localStorage.getItem('access_token');
                const user = JSON.parse(localStorage.getItem('user'));
                console.log('User role:', user?.role);
                
                const response = await axios.get(`http://localhost:8000/api/articles/${numericId}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log('Article response:', response.data);
                setArticle(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching article:', err);
                if (err.response) {
                    console.error('Error response:', err.response.data);
                    setError(`Ошибка при загрузке статьи: ${err.response.data.error || err.response.statusText}`);
                } else {
                    setError('Ошибка при загрузке статьи');
                }
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id, location]);

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

    if (loading) return <div className="loading">Загрузка статьи...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!article) return <div className="error">Статья не найдена</div>;

    const currentPageData = article.pages.find(page => page.page_number === currentPage);

    return (
        <div className="article-view-container">
            <div className="article-header">
                <h1>{article.title}</h1>
                <div className="progress-bar">
                    <div 
                        className="progress-fill"
                        style={{ width: `${article.progress?.progress_percentage || 0}%` }}
                    />
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
                    Предыдущая страница
                </button>
                <span className="page-indicator">
                    Страница {currentPage} из {article.total_pages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === article.total_pages}
                    className="nav-button next-button"
                >
                    Следующая страница
                </button>
            </div>
        </div>
    );
};

export default ArticleView; 