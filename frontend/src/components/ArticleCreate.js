import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ArticleEditor.css';

const ArticleCreate = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        is_published: false
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !user) {
            navigate('/login');
            return;
        }
        
        if (user.role !== 'TEACHER') {
            navigate('/dashboard');
            return;
        }

        setLoading(false);
    }, [navigate]);

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
        setSubmitting(true);

        try {
            const response = await axios.post(
                'http://localhost:8000/api/articles/',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );

            navigate('/articles', { replace: true });
        } catch (err) {
            console.error('Error creating article:', err);
            if (err.response?.data) {
                setError(err.response.data.error || 'Не удалось создать статью');
            } else {
                setError('Ошибка сервера');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    return (
        <div className="article-editor-container">
            <h1>Создание статьи</h1>
            
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
                        Опубликовать сразу
                    </label>
                </div>

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={submitting}
                >
                    {submitting ? 'Создание...' : 'Создать статью'}
                </button>
            </form>
        </div>
    );
};

export default ArticleCreate; 