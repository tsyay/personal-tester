import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/Article.css';

const ArticleView = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchArticle();
    }, [id]);

    const fetchArticle = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/articles/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            const data = await response.json();
            setArticle(data);
            setLoading(false);
        } catch (err) {
            setError('Не удалось загрузить статью');
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Загрузка статьи...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!article) return <div className="error">Статья не найдена</div>;

    const user = JSON.parse(localStorage.getItem('user'));
    const isCreator = user && article.creator.id === user.id;

    return (
        <div className="article-view">
            <div className="article-header">
                <h1>{article.title}</h1>
                <div className="article-meta">
                    <span>Автор: {article.creator.full_name}</span>
                    <span>Опубликовано: {new Date(article.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            {article.featured_image && (
                <img 
                    src={article.featured_image_url} 
                    alt={article.title} 
                    className="article-featured-image"
                />
            )}

            <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="article-actions">
                <Link to="/articles" className="back-button">
                    Назад к списку
                </Link>
                {isCreator && (
                    <Link to={`/articles/${id}/edit`} className="edit-button">
                        Редактировать
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ArticleView; 