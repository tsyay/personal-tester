import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/ArticleEditor.css';

const ArticleEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        is_published: false
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!token) {
            navigate('/login');
            return;
        }

        // Проверяем, что пользователь является учителем
        if (user?.role !== 'TEACHER') {
            navigate('/dashboard');
            return;
        }

        // Загружаем данные статьи
        const fetchArticle = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/articles/${id}/`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                setFormData({
                    title: response.data.title,
                    content: response.data.content,
                    is_published: response.data.is_published
                });
            } catch (err) {
                setError('Не удалось загрузить статью');
            }
        };

        fetchArticle();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await axios.put(
                `http://localhost:8000/api/articles/${id}/`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );

            navigate('/articles', { replace: true });
        } catch (err) {
            if (err.response?.data) {
                setError(err.response.data.error || 'Не удалось обновить статью');
            } else {
                setError('Ошибка сервера');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="article-editor-container">
            <h1>Редактирование статьи</h1>
            
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="article-form">
                <div className="form-group">
                    <label htmlFor="title">Заголовок</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="content">Содержание</label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        rows="10"
                    />
                </div>

                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            name="is_published"
                            checked={formData.is_published}
                            onChange={handleChange}
                        />
                        Опубликовано
                    </label>
                </div>

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading}
                >
                    {loading ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </form>
        </div>
    );
};

export default ArticleEditor; 