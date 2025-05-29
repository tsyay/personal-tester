import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/TestTaking.css';

const TestTaking = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState({ title: '', questions: [] });
    const [answers, setAnswers] = useState([]);
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
                setAnswers(new Array(response.data.questions.length).fill(0));
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
            await axios.post(`http://localhost:8000/api/tests/${testId}/submit/`, 
                { answers },
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

    return (
        <div className="test-taking-container">
            <h1>{test.title}</h1>
            
            <div className="questions-container">
                {test.questions && test.questions.map((question, index) => (
                    <div key={question.id} className="question-card">
                        <h3>Вопрос {index + 1}</h3>
                        <p>{question.text}</p>
                        <div className="options-container">
                            {[1, 2, 3, 4].map((option) => (
                                <div key={option} className="option">
                                    <input
                                        type="radio"
                                        name={`question-${index}`}
                                        checked={answers[index] === option}
                                        onChange={() => {
                                            const newAnswers = [...answers];
                                            newAnswers[index] = option;
                                            setAnswers(newAnswers);
                                        }}
                                    />
                                    <label>Вариант {option}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <button 
                className="submit-button"
                onClick={handleSubmit}
            >
                Завершить тест
            </button>
        </div>
    );
};

export default TestTaking;