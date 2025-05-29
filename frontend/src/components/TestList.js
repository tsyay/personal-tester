import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/TestList.css';

const TestList = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            // Get user info
            axios.get('/api/students/me/', {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(response => {
                setUser(response.data);
            });

            // Get tests
            axios.get('/api/tests/', {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(response => {
                setTests(response.data);
            });
        }
    }, []);

    const canCreateTest = user && (user.role === 'TEACHER' || user.role === 'ADMIN');

    return (
        <div className="test-list-container">
            <div className="test-list-header">
                <h1>Тесты</h1>
                {canCreateTest && (
                    <button 
                        className="create-test-button"
                        onClick={() => navigate('/tests/create')}
                    >
                        Создать тест
                    </button>
                )}
            </div>

            <div className="tests-grid">
                {tests.map(test => (
                    <div key={test.id} className="test-card">
                        <h3>{test.title}</h3>
                        <p>{test.description}</p>
                        <div className="test-info">
                            <span>Тип: {test.test_type}</span>
                            {test.time_limit > 0 && (
                                <span>Время: {test.time_limit} мин.</span>
                            )}
                        </div>
                        <button 
                            className="start-test-button"
                            onClick={() => navigate(`/tests/${test.id}/take`)}
                        >
                            Начать тест
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestList; 