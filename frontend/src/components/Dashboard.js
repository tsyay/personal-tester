import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [recentTests, setRecentTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            navigate('/login');
            return;
        }
        setUser(userData);
        fetchRecentTests();
    }, [navigate]);

    const fetchRecentTests = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/tests/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            setRecentTests(response.data.slice(0, 5));
        } catch (err) {
            setError('Не удалось загрузить тесты');
            console.error('Error fetching tests:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Загрузка панели управления...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="dashboard">
            <h1>Добро пожаловать, {user?.full_name}!</h1>
            
            <div className="dashboard-grid">
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Последние тесты</h2>
                        <Link to="/tests" className="view-all">Все тесты</Link>
                    </div>
                    <div className="test-list">
                        {recentTests.map(test => (
                            <Link to={`/tests/${test.id}`} key={test.id} className="test-card">
                                <h3>{test.title}</h3>
                                <p>{test.description}</p>
                                <div className="test-meta">
                                    <span>Автор: {test.creator.full_name}</span>
                                    <span>{new Date(test.created_at).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="dashboard-actions">
                {user?.role === 'TEACHER' && (
                    <>
                        <Link to="/tests/create" className="action-button">
                            Создать тест
                        </Link>
                        <Link to="/articles/create" className="action-button">
                            Создать статью
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard; 