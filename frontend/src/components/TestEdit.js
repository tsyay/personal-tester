import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Test.css';

const TestEdit = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [testData, setTestData] = useState({
        title: '',
        description: '',
        questions: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                setTestData(data);
            } else {
                setError('Не удалось загрузить тест');
            }
        } catch (err) {
            setError('Ошибка сервера');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTestData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuestionChange = (index, field, value) => {
        setTestData(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[index] = {
                ...newQuestions[index],
                [field]: value
            };
            return {
                ...prev,
                questions: newQuestions
            };
        });
    };

    const handleOptionChange = (questionIndex, optionIndex, value) => {
        setTestData(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[questionIndex].options[optionIndex] = value;
            return {
                ...prev,
                questions: newQuestions
            };
        });
    };

    const addQuestion = () => {
        setTestData(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    text: '',
                    options: ['', '', '', ''],
                    correct_option: 0
                }
            ]
        }));
    };

    const removeQuestion = (index) => {
        setTestData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/tests/${testId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });

            if (response.ok) {
                navigate(`/tests/${testId}`);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Ошибка обновления теста');
            }
        } catch (err) {
            setError('Ошибка сервера');
        }
    };

    if (loading) return <div className="loading">Загрузка теста...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="test-edit-container">
            <h1>Редактирование теста</h1>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="test-form">
                <div className="form-group">
                    <label htmlFor="title">Название теста:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={testData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Описание:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={testData.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="questions-section">
                    <h2>Вопросы</h2>
                    {testData.questions.map((question, questionIndex) => (
                        <div key={questionIndex} className="question-card">
                            <div className="question-header">
                                <h3>Вопрос {questionIndex + 1}</h3>
                                <button
                                    type="button"
                                    className="remove-question-button"
                                    onClick={() => removeQuestion(questionIndex)}
                                >
                                    Удалить
                                </button>
                            </div>

                            <div className="form-group">
                                <label htmlFor={`question-${questionIndex}`}>Текст вопроса:</label>
                                <input
                                    type="text"
                                    id={`question-${questionIndex}`}
                                    value={question.text}
                                    onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="options-section">
                                <h4>Варианты ответов:</h4>
                                {question.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="option-group">
                                        <input
                                            type="radio"
                                            name={`correct-${questionIndex}`}
                                            checked={question.correct_option === optionIndex}
                                            onChange={() => handleQuestionChange(questionIndex, 'correct_option', optionIndex)}
                                        />
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                                            placeholder={`Вариант ${optionIndex + 1}`}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="add-question-button"
                        onClick={addQuestion}
                    >
                        Добавить вопрос
                    </button>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        Сохранить изменения
                    </button>
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => navigate(`/tests/${testId}`)}
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TestEdit; 