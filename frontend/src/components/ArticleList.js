import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
            const response = await axios.get('http://localhost:8000/api/articles/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            console.log('Fetched articles:', response.data); // Debug log
            if (Array.isArray(response.data)) {
                setArticles(response.data);
            } else {
                console.error('Invalid articles data:', response.data);
                setError('Неверный формат данных статей');
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching articles:', err);
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
                {articles.map(article => {
                    console.log('Rendering article:', article);
                    if (!article || !article.id) {
                        console.error('Invalid article data:', article);
                        return null;
                    }
                    const articleUrl = `/articles/${article.id}`;
                    console.log('Generated article URL:', articleUrl);
                    return (
                        <Link 
                            to={articleUrl} 
                            key={article.id} 
                            className="article-card"
                            onClick={(e) => {
                                console.log('Clicking article link:', articleUrl);
                            }}
                        >
                            {article.featured_image && (
                                <img 
                                    src={article.featured_image_url} 
                                    alt={article.title} 
                                    className="article-card-image"
                                />
                            )}
                            <div className="article-card-content">
                                <h3>{article.title}</h3>
                                <p>{article.description}</p>
                                <div className="article-card-meta">
                                    <span>Автор: {article.creator.full_name}</span>
                                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="article-card-meta">
                                    <span>Страниц: {article.total_pages}</span>
                                    {!article.is_published && (
                                        <span className="article-status unpublished">Черновик</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default ArticleList; 