import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Test.css';

const TestView = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchTest();
    }, [testId]);

    const fetchTest = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/tests/${testId}/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTest(data);
            } else {
                setError('Не удалось загрузить тест');
            }
        } catch (err) {
            setError('Ошибка сервера');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить этот тест?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/tests/${testId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                navigate('/tests');
            } else {
                setError('Не удалось удалить тест');
            }
        } catch (err) {
            setError('Ошибка сервера');
        }
    };

    if (loading) return <div className="loading">Загрузка теста...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!test) return <div className="error">Тест не найден</div>;

    return (
        <div className="test-view-container">
            <div className="test-header">
                <h1>{test.title}</h1>
                <div className="test-meta">
                    <span>Автор: {test.creator.full_name}</span>
                    <span>Создан: {new Date(test.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="test-description">
                <h2>Описание</h2>
                <p>{test.description}</p>
            </div>

            <div className="test-questions">
                <h2>Вопросы ({test.questions.length})</h2>
                {test.questions.map((question, index) => (
                    <div key={index} className="question-card">
                        <h3>Вопрос {index + 1}</h3>
                        <p>{question.text}</p>
                        <div className="options-list">
                            {question.options.map((option, optionIndex) => (
                                <div
                                    key={optionIndex}
                                    className={`option ${optionIndex === question.correct_option ? 'correct' : ''}`}
                                >
                                    {option}
                                    {optionIndex === question.correct_option && (
                                        <span className="correct-mark">✓</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="test-actions">
                {user?.role === 'STUDENT' ? (
                    <button
                        className="take-test-button"
                        onClick={() => navigate(`/tests/${testId}/take`)}
                    >
                        Пройти тест
                    </button>
                ) : (
                    <>
                        <button
                            className="edit-test-button"
                            onClick={() => navigate(`/tests/${testId}/edit`)}
                        >
                            Редактировать
                        </button>
                        <button
                            className="delete-test-button"
                            onClick={handleDelete}
                        >
                            Удалить
                        </button>
                    </>
                )}
                <button
                    className="back-button"
                    onClick={() => navigate('/tests')}
                >
                    Назад к списку
                </button>
            </div>
        </div>
    );
};

export default TestView; 