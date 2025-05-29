import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/TestCreate.css';

const TestCreate = () => {
    const navigate = useNavigate();
    const [test, setTest] = useState({
        title: '',
        description: '',
        test_type: 'MULTIPLE_CHOICE',
        time_limit: 0,
        questions: [
            {
                text: '',
                question_type: 'MULTIPLE_CHOICE',
                points: 1,
                answers: [
                    { text: '', is_correct: false },
                    { text: '', is_correct: false },
                    { text: '', is_correct: false },
                    { text: '', is_correct: false }
                ]
            }
        ]
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        
        axios.post('/api/tests/', test, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(() => {
            navigate('/tests');
        });
    };

    const addQuestion = () => {
        setTest(prev => ({
            ...prev,
            questions: [...prev.questions, {
                text: '',
                question_type: 'MULTIPLE_CHOICE',
                points: 1,
                answers: [
                    { text: '', is_correct: false },
                    { text: '', is_correct: false },
                    { text: '', is_correct: false },
                    { text: '', is_correct: false }
                ]
            }]
        }));
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...test.questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
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

    return (
        <div className="test-create-container">
            <h1>Создание теста</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Название теста:</label>
                    <input
                        type="text"
                        value={test.title}
                        onChange={(e) => setTest(prev => ({ ...prev, title: e.target.value }))}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Описание:</label>
                    <textarea
                        value={test.description}
                        onChange={(e) => setTest(prev => ({ ...prev, description: e.target.value }))}
                        required
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
                        onChange={(e) => setTest(prev => ({ ...prev, time_limit: parseInt(e.target.value) }))}
                        min="0"
                    />
                </div>

                <div className="questions-section">
                    <h2>Вопросы</h2>
                    {test.questions.map((question, questionIndex) => (
                        <div key={questionIndex} className="question-card">
                            <div className="form-group">
                                <label>Вопрос {questionIndex + 1}:</label>
                                <input
                                    type="text"
                                    value={question.text}
                                    onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                                    required
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
                                    onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value))}
                                    min="1"
                                    required
                                />
                            </div>

                            {question.question_type === 'MULTIPLE_CHOICE' && (
                                <div className="answers-section">
                                    <label>Варианты ответов:</label>
                                    {question.answers.map((answer, answerIndex) => (
                                        <div key={answerIndex} className="answer-input">
                                            <input
                                                type="text"
                                                value={answer.text}
                                                onChange={(e) => updateAnswer(questionIndex, answerIndex, 'text', e.target.value)}
                                                placeholder={`Вариант ${answerIndex + 1}`}
                                                required
                                            />
                                            <label>
                                                <input
                                                    type="radio"
                                                    name={`correct-${questionIndex}`}
                                                    checked={answer.is_correct}
                                                    onChange={() => {
                                                        const newAnswers = question.answers.map((a, i) => ({
                                                            ...a,
                                                            is_correct: i === answerIndex
                                                        }));
                                                        updateQuestion(questionIndex, 'answers', newAnswers);
                                                    }}
                                                />
                                                Правильный ответ
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addQuestion} className="add-question-button">
                        Добавить вопрос
                    </button>
                </div>

                <button type="submit" className="submit-button">
                    Создать тест
                </button>
            </form>
        </div>
    );
};

export default TestCreate; 