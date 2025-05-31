import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';
import '../styles/TestResults.css';

const TestResults = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await axios.get(`http://localhost:8000/api/tests/${testId}/results/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log('Results data:', response.data);
                setResults(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching results:', err);
                setError(err.response?.data?.error || 'Ошибка при загрузке результатов');
                setLoading(false);
            }
        };

        fetchResults();
    }, [testId]);

    if (loading) {
        return (
            <div className="test-results-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Загрузка результатов...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="test-results-container">
                <div className="error-state">
                    <XCircle className="error-icon" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="test-results-container">
                <div className="error-state">
                    <XCircle className="error-icon" />
                    <p>Результаты не найдены</p>
                </div>
            </div>
        );
    }

    return (
        <div className="test-results-container">
            <div className="test-header">
                <button onClick={() => navigate('/tests')} className="back-button">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Назад к тестам
                </button>
                <h1>Результаты теста: {results.test.title}</h1>
            </div>
            
            <div className="score-section">
                <h2>Ваш результат: {results.attempt.score.toFixed(1)}%</h2>
                <p>Завершено: {new Date(results.attempt.completed_at).toLocaleString()}</p>
            </div>

            <div className="answers-section">
                <h3>Ваши ответы:</h3>
                {results.attempt.answers.map((answer, index) => (
                    <div key={index} className={`answer-card ${answer.is_correct ? 'correct' : 'incorrect'}`}>
                        <h4>Вопрос {index + 1}</h4>
                        <p className="question-text">{answer.question_text}</p>
                        <p className="answer-text">
                            Ваш ответ: {answer.selected_answer || 'Нет ответа'}
                        </p>
                        <p className="result-status">
                            {answer.is_correct ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4 inline mr-1" />
                                    Правильно
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4 inline mr-1" />
                                    Неправильно
                                </>
                            )}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestResults; 