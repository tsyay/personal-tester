import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
                console.log('Results data:', response.data); // Debug log
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

    if (loading) return <div className="loading">Загрузка результатов...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!results) return <div className="error">Результаты не найдены</div>;

    return (
        <div className="test-results-container">
            <h1>Результаты теста: {results.test.title}</h1>
            
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
                            {answer.is_correct ? '✓ Правильно' : '✗ Неправильно'}
                        </p>
                    </div>
                ))}
            </div>

            <button 
                className="back-button"
                onClick={() => navigate('/tests')}
            >
                Вернуться к списку тестов
            </button>
        </div>
    );
};

export default TestResults; 