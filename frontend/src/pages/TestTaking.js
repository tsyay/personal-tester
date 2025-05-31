import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import '../styles/TestTaking.css';

const TestTaking = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await axios.get(`http://localhost:8000/api/tests/${testId}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log('Test data:', response.data);
                setTest(response.data);
                if (response.data.time_limit) {
                    setTimeLeft(response.data.time_limit * 60); // Convert minutes to seconds
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching test:', err);
                setError('Ошибка при загрузке теста');
                setLoading(false);
            }
        };

        fetchTest();
    }, [testId]);

    useEffect(() => {
        if (timeLeft === null) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const answerIds = test.questions.map(question => {
                if (question.question_type === 'TEXT_INPUT') {
                    return answers[question.id] || '';
                }
                return answers[question.id] || null;
            });
            
            await axios.post(`http://localhost:8000/api/tests/${testId}/submit/`, 
                { answers: answerIds },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            navigate(`/tests/${testId}/results`);
        } catch (err) {
            console.error('Error submitting test:', err);
            setError('Ошибка при отправке ответов');
        }
    };

    const handleAnswerSelect = (questionId, answerId) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerId
        }));
    };

    const handleTextAnswer = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestion < test.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    if (loading) return (
        <div className="test-taking-container">
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Загрузка теста...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="test-taking-container">
            <div className="error-state">
                <AlertCircle className="error-icon" />
                <p>{error}</p>
            </div>
        </div>
    );

    if (!test) return (
        <div className="test-taking-container">
            <div className="error-state">
                <AlertCircle className="error-icon" />
                <p>Тест не найден</p>
            </div>
        </div>
    );

    const currentQ = test.questions[currentQuestion];

    return (
        <div className="test-taking-container">
            <div className="test-header">
                <div className="test-info">
                    <h1>{test.title}</h1>
                    <div className="test-meta">
                        <span className="question-counter">
                            Вопрос {currentQuestion + 1} из {test.questions.length}
                        </span>
                        {timeLeft !== null && (
                            <div className="timer">
                                <Clock className="timer-icon" />
                                <span>{formatTime(timeLeft)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="test-content">
                <div className="question-card">
                    <div className="question-header">
                        <h2>Вопрос {currentQuestion + 1}</h2>
                        <span className="question-type">
                            {currentQ.question_type === 'MULTIPLE_CHOICE' ? 'Выберите один ответ' : 'Введите ответ'}
                        </span>
                    </div>
                    
                    <div className="question-content">
                        <p>{currentQ.text}</p>
                        
                        <div className="answers-container">
                            {currentQ.question_type === 'MULTIPLE_CHOICE' ? (
                                currentQ.answers.map((answer) => (
                                    <div 
                                        key={answer.id} 
                                        className={`answer-option ${answers[currentQ.id] === answer.id ? 'selected' : ''}`}
                                        onClick={() => handleAnswerSelect(currentQ.id, answer.id)}
                                    >
                                        <div className="answer-radio">
                                            <div className="radio-inner"></div>
                                        </div>
                                        <span>{answer.text}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-answer-container">
                                    <input
                                        type="text"
                                        value={answers[currentQ.id] || ''}
                                        onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
                                        placeholder="Введите ваш ответ"
                                        className="text-answer-input"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="navigation-buttons">
                    <button 
                        className="nav-button prev"
                        onClick={handlePrevQuestion}
                        disabled={currentQuestion === 0}
                    >
                        Назад
                    </button>
                    
                    {currentQuestion === test.questions.length - 1 ? (
                        <button 
                            className="submit-button"
                            onClick={handleSubmit}
                        >
                            Завершить тест
                            <CheckCircle2 className="button-icon" />
                        </button>
                    ) : (
                        <button 
                            className="nav-button next"
                            onClick={handleNextQuestion}
                        >
                            Следующий вопрос
                            <ArrowRight className="button-icon" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestTaking; 