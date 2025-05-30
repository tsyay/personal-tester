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
                    { text: '', is_correct: false }
                ]
            }
        ]
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        
        axios.post('http://localhost:8000/api/tests/', test, {
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
                    { text: '', is_correct: false }
                ]
            }]
        }));
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...test.questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        
        // If changing to text input, remove answers
        if (field === 'question_type' && value === 'TEXT_INPUT') {
            newQuestions[index].answers = [];
        } 
        // If changing to multiple choice and no answers exist, add default answer
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
                        onChange={(e) => setTest(prev => ({ ...prev, time_limit: parseInt(e.target.value) || 0 }))}
                        min="0"
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
                                    className="remove-question-button"
                                    onClick={() => removeQuestion(questionIndex)}
                                >
                                    Удалить вопрос
                                </button>
                            </div>

                            <div className="form-group">
                                <label>Текст вопроса:</label>
                                <textarea
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
                                    onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value) || 1)}
                                    min="1"
                                />
                            </div>

                            {question.question_type === 'MULTIPLE_CHOICE' && (
                                <div className="answers-section">
                                    <h4>Варианты ответов:</h4>
                                    {question.answers.map((answer, answerIndex) => (
                                        <div key={answerIndex} className="answer-item">
                                            <input
                                                type="text"
                                                value={answer.text}
                                                onChange={(e) => updateAnswer(questionIndex, answerIndex, 'text', e.target.value)}
                                                placeholder="Текст ответа"
                                                required
                                            />
                                            <label>
                                                <input
                                                    type="radio"
                                                    name={`correct-${questionIndex}`}
                                                    checked={answer.is_correct}
                                                    onChange={() => {
                                                        const newQuestions = [...test.questions];
                                                        newQuestions[questionIndex].answers.forEach((a, i) => {
                                                            a.is_correct = i === answerIndex;
                                                        });
                                                        setTest(prev => ({ ...prev, questions: newQuestions }));
                                                    }}
                                                />
                                                Правильный ответ
                                            </label>
                                            <button
                                                type="button"
                                                className="remove-answer-button"
                                                onClick={() => removeAnswer(questionIndex, answerIndex)}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="add-answer-button"
                                        onClick={() => addAnswer(questionIndex)}
                                    >
                                        Добавить вариант ответа
                                    </button>
                                </div>
                            )}

                            {question.question_type === 'TEXT_INPUT' && (
                                <div className="answers-section">
                                    <h4>Правильный ответ:</h4>
                                    <div className="answer-item">
                                        <input
                                            type="text"
                                            value={question.answers[0]?.text || ''}
                                            onChange={(e) => {
                                                const newQuestions = [...test.questions];
                                                if (!newQuestions[questionIndex].answers.length) {
                                                    newQuestions[questionIndex].answers = [{ text: '', is_correct: true }];
                                                }
                                                newQuestions[questionIndex].answers[0].text = e.target.value;
                                                setTest(prev => ({ ...prev, questions: newQuestions }));
                                            }}
                                            placeholder="Введите правильный ответ"
                                            required
                                        />
                                    </div>
                                </div>
                            )}
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

                <button type="submit" className="submit-button">
                    Создать тест
                </button>
            </form>
        </div>
    );
};

export default TestCreate; 