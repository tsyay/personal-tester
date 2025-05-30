import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ArticleEditor.css';

const ArticleCreate = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        is_published: false,
        total_pages: 1,
        pages: [
            {
                title: '',
                content: '',
                page_number: 1
            }
        ]
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
        if (name.startsWith('page_')) {
            const [_, pageIndex, field] = name.split('_');
            setFormData(prev => ({
                ...prev,
                pages: prev.pages.map((page, index) => 
                    index === parseInt(pageIndex) 
                        ? { ...page, [field]: value }
                        : page
                )
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const addPage = () => {
        setFormData(prev => ({
            ...prev,
            total_pages: prev.total_pages + 1,
            pages: [
                ...prev.pages,
                {
                    title: '',
                    content: '',
                    page_number: prev.total_pages + 1
                }
            ]
        }));
    };

    const removePage = (index) => {
        if (formData.total_pages <= 1) return;
        
        setFormData(prev => ({
            ...prev,
            total_pages: prev.total_pages - 1,
            pages: prev.pages
                .filter((_, i) => i !== index)
                .map((page, i) => ({ ...page, page_number: i + 1 }))
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            console.log('Creating article with user:', user);
            console.log('Form data:', formData);
            
            const response = await axios.post(
                'http://localhost:8000/api/articles/',
                {
                    ...formData,
                    creator: user.id
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );

            console.log('Article creation response:', response.data);
            if (response.data && response.data.id) {
                console.log('Article created with ID:', response.data.id);
                navigate('/articles', { replace: true });
            } else {
                console.error('No article ID in response:', response.data);
                setError('Ошибка: ID статьи не получен от сервера');
            }
        } catch (err) {
            console.error('Error creating article:', err);
            if (err.response?.data) {
                console.error('Error response:', err.response.data);
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
                    <label htmlFor="title">Заголовок статьи</label>
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
                    <label htmlFor="description">Описание</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="3"
                    />
                </div>

                {formData.pages.map((page, index) => (
                    <div key={index} className="page-section">
                        <h3>Страница {page.page_number}</h3>
                        <div className="form-group">
                            <label htmlFor={`page_${index}_title`}>Заголовок страницы</label>
                            <input
                                type="text"
                                id={`page_${index}_title`}
                                name={`page_${index}_title`}
                                value={page.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`page_${index}_content`}>Содержание страницы</label>
                            <textarea
                                id={`page_${index}_content`}
                                name={`page_${index}_content`}
                                value={page.content}
                                onChange={handleChange}
                                required
                                rows="10"
                            />
                        </div>
                        {formData.total_pages > 1 && (
                            <button
                                type="button"
                                className="remove-page-button"
                                onClick={() => removePage(index)}
                            >
                                Удалить страницу
                            </button>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    className="add-page-button"
                    onClick={addPage}
                >
                    Добавить страницу
                </button>

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