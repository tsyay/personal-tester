import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Article.css';

const ArticleList = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/articles/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            const data = await response.json();
            setArticles(data);
            setLoading(false);
        } catch (err) {
            setError('Не удалось загрузить статьи');
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Загрузка статей...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="article-list">
            <div className="article-list-header">
                <h2>Статьи</h2>
                <Link to="/articles/create" className="create-article-button">
                    Создать статью
                </Link>
            </div>

            <div className="article-grid">
                {articles.map(article => (
                    <Link to={`/articles/${article.id}`} key={article.id} className="article-card">
                        {article.featured_image && (
                            <img 
                                src={article.featured_image_url} 
                                alt={article.title} 
                                className="article-card-image"
                            />
                        )}
                        <div className="article-card-content">
                            <h3>{article.title}</h3>
                            <p>{article.content.substring(0, 150)}...</p>
                            <div className="article-card-meta">
                                <span>Автор: {article.creator.full_name}</span>
                                <span>{new Date(article.created_at).toLocaleDateString()}</span>
                            </div>
                            {!article.is_published && (
                                <span className="article-status unpublished">Черновик</span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ArticleList; 