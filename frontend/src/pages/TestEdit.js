import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import '../styles/TestCreate.css';

const TestEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [test, setTest] = useState({
        title: '',
        description: '',
        test_type: 'MULTIPLE_CHOICE',
        time_limit: 0,
        questions: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTest();
    }, [id]);

    const fetchTest = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/tests/${id}/`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            setTest(response.data);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8000/api/tests/${id}/`, test, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            navigate('/tests');
        } catch (error) {
            console.error('Error updating test:', error);
            setError('Не удалось обновить тест');
        }
    };

    const addQuestion = () => {
        setTest(prev => ({
            ...prev,
            questions: [...prev.questions, {
                text: '',
                question_type: 'MULTIPLE_CHOICE',
                points: 1,
                answers: [
                    { text: '', is_correct: false }
                ]
            }]
        }));
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...test.questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        
        if (field === 'question_type' && value === 'TEXT_INPUT') {
            newQuestions[index].answers = [];
        } 
        else if (field === 'question_type' && value === 'MULTIPLE_CHOICE' && 
                (!newQuestions[index].answers || newQuestions[index].answers.length === 0)) {
            newQuestions[index].answers = [{ text: '', is_correct: false }];
        }
        
        setTest(prev => ({ ...prev, questions: newQuestions }));
    };

    const addAnswer = (questionIndex) => {
        const newQuestions = [...test.questions];
        newQuestions[questionIndex].answers.push({ text: '', is_correct: false });
        setTest(prev => ({ ...prev, questions: newQuestions }));
    };

    const removeAnswer = (questionIndex, answerIndex) => {
        const newQuestions = [...test.questions];
        newQuestions[questionIndex].answers.splice(answerIndex, 1);
        setTest(prev => ({ ...prev, questions: newQuestions }));
    };

    const updateAnswer = (questionIndex, answerIndex, field, value) => {
        const newQuestions = [...test.questions];
        newQuestions[questionIndex].answers[answerIndex] = {
            ...newQuestions[questionIndex].answers[answerIndex],
            [field]: value
        };
        setTest(prev => ({ ...prev, questions: newQuestions }));
    };

    const removeQuestion = (index) => {
        const newQuestions = [...test.questions];
        newQuestions.splice(index, 1);
        setTest(prev => ({ ...prev, questions: newQuestions }));
    };

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="test-create-container">
            <div className="test-create-header">
                <button onClick={() => navigate('/tests')} className="back-button">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Назад к тестам
                </button>
                <h1>Редактирование теста</h1>
            </div>

            <form onSubmit={handleSubmit} className="test-create-form">
                <div className="form-group">
                    <label>Название теста:</label>
                    <input
                        type="text"
                        value={test.title}
                        onChange={(e) => setTest(prev => ({ ...prev, title: e.target.value }))}
                        required
                        placeholder="Введите название теста"
                    />
                </div>

                <div className="form-group">
                    <label>Описание:</label>
                    <textarea
                        value={test.description}
                        onChange={(e) => setTest(prev => ({ ...prev, description: e.target.value }))}
                        required
                        placeholder="Введите описание теста"
                    />
                </div>

                <div className="form-group">
                    <label>Тип теста:</label>
                    <select
                        value={test.test_type}
                        onChange={(e) => setTest(prev => ({ ...prev, test_type: e.target.value }))}
                    >
                        <option value="MULTIPLE_CHOICE">Множественный выбор</option>
                        <option value="TEXT_INPUT">Текстовый ввод</option>
                        <option value="MIXED">Смешанный</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Ограничение по времени (минуты):</label>
                    <input
                        type="number"
                        value={test.time_limit}
                        onChange={(e) => setTest(prev => ({ ...prev, time_limit: parseInt(e.target.value) || 0 }))}
                        min="0"
                        placeholder="0 - без ограничения"
                    />
                </div>

                <div className="questions-section">
                    <h2>Вопросы</h2>
                    {test.questions.map((question, questionIndex) => (
                        <div key={questionIndex} className="question-card">
                            <div className="question-header">
                                <h3>Вопрос {questionIndex + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(questionIndex)}
                                    className="remove-button"
                                >
                                    Удалить
                                </button>
                            </div>

                            <div className="form-group">
                                <label>Текст вопроса:</label>
                                <textarea
                                    value={question.text}
                                    onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                                    required
                                    placeholder="Введите текст вопроса"
                                />
                            </div>

                            <div className="form-group">
                                <label>Тип вопроса:</label>
                                <select
                                    value={question.question_type}
                                    onChange={(e) => updateQuestion(questionIndex, 'question_type', e.target.value)}
                                >
                                    <option value="MULTIPLE_CHOICE">Множественный выбор</option>
                                    <option value="TEXT_INPUT">Текстовый ввод</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Баллы:</label>
                                <input
                                    type="number"
                                    value={question.points}
                                    onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value) || 0)}
                                    min="1"
                                    required
                                />
                            </div>

                            {question.question_type === 'MULTIPLE_CHOICE' && (
                                <div className="answers-section">
                                    <h4>Варианты ответов</h4>
                                    {question.answers.map((answer, answerIndex) => (
                                        <div key={answerIndex} className="answer-item">
                                            <input
                                                type="text"
                                                value={answer.text}
                                                onChange={(e) => updateAnswer(questionIndex, answerIndex, 'text', e.target.value)}
                                                placeholder="Введите вариант ответа"
                                                required
                                            />
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={answer.is_correct}
                                                    onChange={(e) => updateAnswer(questionIndex, answerIndex, 'is_correct', e.target.checked)}
                                                />
                                                Правильный ответ
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => removeAnswer(questionIndex, answerIndex)}
                                                className="remove-button"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addAnswer(questionIndex)}
                                        className="add-button"
                                    >
                                        Добавить вариант ответа
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addQuestion}
                        className="add-button"
                    >
                        Добавить вопрос
                    </button>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        Сохранить изменения
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TestEdit; 