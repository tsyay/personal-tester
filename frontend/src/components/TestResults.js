import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Test.css';

const TestResults = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchResults();
    }, [testId]);

    const fetchResults = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/tests/${testId}/results/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setResults(data);
            } else {
                setError('Не удалось загрузить результаты');
            }
        } catch (err) {
            setError('Ошибка сервера');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Загрузка результатов...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!results) return <div className="error">Результаты не найдены</div>;

    const calculateScore = () => {
        const totalQuestions = results.questions.length;
        const correctAnswers = results.answers.filter(
            (answer, index) => answer === results.questions[index].correct_option
        ).length;
        return {
            correct: correctAnswers,
            total: totalQuestions,
            percentage: Math.round((correctAnswers / totalQuestions) * 100)
        };
    };

    const score = calculateScore();

    return (
        <div className="test-results-container">
            <h1>Результаты теста</h1>
            
            <div className="score-summary">
                <h2>Итоговый результат</h2>
                <div className="score-details">
                    <p>Правильных ответов: {score.correct} из {score.total}</p>
                    <p>Процент выполнения: {score.percentage}%</p>
                </div>
            </div>

            <div className="questions-review">
                <h2>Разбор ответов</h2>
                {results.questions.map((question, index) => {
                    const isCorrect = results.answers[index] === question.correct_option;
                    return (
                        <div key={index} className={`question-review ${isCorrect ? 'correct' : 'incorrect'}`}>
                            <h3>Вопрос {index + 1}</h3>
                            <p className="question-text">{question.text}</p>
                            
                            <div className="options-review">
                                {question.options.map((option, optionIndex) => (
                                    <div
                                        key={optionIndex}
                                        className={`option ${optionIndex === question.correct_option ? 'correct' : ''} 
                                            ${optionIndex === results.answers[index] && !isCorrect ? 'incorrect' : ''}`}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="answer-status">
                                {isCorrect ? (
                                    <span className="correct-message">Правильный ответ</span>
                                ) : (
                                    <span className="incorrect-message">
                                        Неправильный ответ. Правильный ответ: {question.options[question.correct_option]}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="results-actions">
                <button
                    className="back-button"
                    onClick={() => navigate('/tests')}
                >
                    Вернуться к списку тестов
                </button>
            </div>
        </div>
    );
};

export default TestResults; 