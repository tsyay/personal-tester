import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/TestTaking.css';

const TestTaking = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await axios.get(`http://localhost:8000/api/tests/${testId}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log('Test data:', response.data); // Debug log
                setTest(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching test:', err);
                setError('Ошибка при загрузке теста');
                setLoading(false);
            }
        };

        fetchTest();
    }, [testId]);

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('access_token');
            // Convert answers object to array of answer IDs or text responses
            const answerIds = test.questions.map(question => {
                if (question.question_type === 'TEXT_INPUT') {
                    return answers[question.id] || ''; // Return text response for text input
                }
                return answers[question.id] || null; // Return answer ID for multiple choice
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

    if (loading) return <div className="loading">Загрузка теста...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!test) return <div className="error">Тест не найден</div>;

    return (
        <div className="test-taking-container">
            <h1>{test.title}</h1>
            
            <div className="questions-container">
                {test.questions && test.questions.map((question) => (
                    <div key={question.id} className="question-card">
                        <h3>Вопрос {question.id}</h3>
                        <p>{question.text}</p>
                        <div className="options-container">
                            {question.question_type === 'MULTIPLE_CHOICE' ? (
                                question.answers && question.answers.map((answer) => (
                                    <div key={answer.id} className="option">
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            checked={answers[question.id] === answer.id}
                                            onChange={() => {
                                                setAnswers(prev => ({
                                                    ...prev,
                                                    [question.id]: answer.id
                                                }));
                                            }}
                                        />
                                        <label>{answer.text}</label>
                                    </div>
                                ))
                            ) : (
                                <div className="text-input-container">
                                    <input
                                        type="text"
                                        value={answers[question.id] || ''}
                                        onChange={(e) => {
                                            setAnswers(prev => ({
                                                ...prev,
                                                [question.id]: e.target.value
                                            }));
                                        }}
                                        placeholder="Введите ваш ответ"
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button 
                className="submit-button"
                onClick={handleSubmit}
                disabled={!test.questions || test.questions.length === 0}
            >
                Завершить тест
            </button>
        </div>
    );
};

export default TestTaking;