import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, BookOpen } from 'lucide-react';
import axios from 'axios';
import '../styles/ArticleCreate.css';

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
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/students/me/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.data.role !== 'TEACHER' && response.data.role !== 'ADMIN') {
                    navigate('/articles');
                    return;
                }
                
                setUser(response.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login');
                    return;
                }
                setError('Ошибка при загрузке данных пользователя');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
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

            if (response.data && response.data.id) {
                navigate('/articles', { replace: true });
            } else {
                setError('Ошибка: ID статьи не получен от сервера');
            }
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
        return (
            <div className="article-create-container">
                <div className="loading-container">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="article-create-container">
            <div className="article-create-header">
                <div className="header-content">
                    <Link to="/articles" className="back-button">
                        <ArrowLeft className="h-5 w-5" />
                        Назад к статьям
                    </Link>
                    <h1>Создание статьи</h1>
                    <p className="header-description">
                        Заполните информацию о статье и добавьте страницы с контентом
                    </p>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="article-form">
                <div className="form-section">
                    <h2 className="section-title">Основная информация</h2>
                    <div className="form-group">
                        <label htmlFor="title">Заголовок статьи</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Введите заголовок статьи"
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
                            placeholder="Введите краткое описание статьи"
                            required
                            rows="3"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <div className="section-header">
                        <h2 className="section-title">Страницы статьи</h2>
                        <button
                            type="button"
                            className="add-page-button"
                            onClick={addPage}
                        >
                            <Plus className="h-5 w-5" />
                            Добавить страницу
                        </button>
                    </div>

                    {formData.pages.map((page, index) => (
                        <div key={index} className="page-section">
                            <div className="page-header">
                                <h3>Страница {page.page_number}</h3>
                                {formData.total_pages > 1 && (
                                    <button
                                        type="button"
                                        className="remove-page-button"
                                        onClick={() => removePage(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Удалить
                                    </button>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor={`page_${index}_title`}>Заголовок страницы</label>
                                <input
                                    type="text"
                                    id={`page_${index}_title`}
                                    name={`page_${index}_title`}
                                    value={page.title}
                                    onChange={handleChange}
                                    placeholder="Введите заголовок страницы"
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
                                    placeholder="Введите содержание страницы"
                                    required
                                    rows="10"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="form-section">
                    <div className="form-group checkbox">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="is_published"
                                checked={formData.is_published}
                                onChange={handleChange}
                            />
                            <span>Опубликовать сразу</span>
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={submitting}
                    >
                        <BookOpen className="h-5 w-5" />
                        {submitting ? 'Создание...' : 'Создать статью'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ArticleCreate; 