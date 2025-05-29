import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Test.css';

const TestForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        test_type: 'MULTIPLE_CHOICE',
        time_limit: 0,
        is_published: false,
        questions: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditing) {
            fetchTest();
        }
    }, [id]);

    const fetchTest = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/tests/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setFormData(data);
            } else {
                setError('Failed to fetch test');
            }
        } catch (err) {
            setError('An error occurred while fetching test');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index] = {
            ...newQuestions[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            questions: newQuestions
        }));
    };

    const handleAnswerChange = (questionIndex, answerIndex, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[questionIndex].answers[answerIndex] = {
            ...newQuestions[questionIndex].answers[answerIndex],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            questions: newQuestions
        }));
    };

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    text: '',
                    question_type: formData.test_type,
                    points: 1,
                    answers: []
                }
            ]
        }));
    };

    const removeQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const addAnswer = (questionIndex) => {
        const newQuestions = [...formData.questions];
        newQuestions[questionIndex].answers = [
            ...newQuestions[questionIndex].answers,
            { text: '', is_correct: false }
        ];
        setFormData(prev => ({
            ...prev,
            questions: newQuestions
        }));
    };

    const removeAnswer = (questionIndex, answerIndex) => {
        const newQuestions = [...formData.questions];
        newQuestions[questionIndex].answers = newQuestions[questionIndex].answers.filter(
            (_, i) => i !== answerIndex
        );
        setFormData(prev => ({
            ...prev,
            questions: newQuestions
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                isEditing 
                    ? `http://localhost:8000/api/tests/${id}/`
                    : 'http://localhost:8000/api/tests/',
                {
                    method: isEditing ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    },
                    body: JSON.stringify(formData)
                }
            );

            if (response.ok) {
                navigate('/tests');
            } else {
                const data = await response.json();
                setError(Object.values(data).flat().join(', '));
            }
        } catch (err) {
            setError('An error occurred while saving the test');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="test-form" onSubmit={handleSubmit}>
            <h2>{isEditing ? 'Edit Test' : 'Create New Test'}</h2>

            <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="test_type">Test Type</label>
                <select
                    id="test_type"
                    name="test_type"
                    value={formData.test_type}
                    onChange={handleChange}
                >
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="TEXT_INPUT">Text Input</option>
                    <option value="MIXED">Mixed</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="time_limit">Time Limit (minutes, 0 for no limit)</label>
                <input
                    type="number"
                    id="time_limit"
                    name="time_limit"
                    value={formData.time_limit}
                    onChange={handleChange}
                    min="0"
                />
            </div>

            <div className="form-group">
                <label>
                    <input
                        type="checkbox"
                        name="is_published"
                        checked={formData.is_published}
                        onChange={handleChange}
                    />
                    Publish Test
                </label>
            </div>

            <div className="question-list">
                <h3>Questions</h3>
                {formData.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="question-item">
                        <div className="question-header">
                            <h4>Question {questionIndex + 1}</h4>
                            <button
                                type="button"
                                className="remove-button"
                                onClick={() => removeQuestion(questionIndex)}
                            >
                                Remove Question
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Question Text</label>
                            <textarea
                                value={question.text}
                                onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Points</label>
                            <input
                                type="number"
                                value={question.points}
                                onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value))}
                                min="1"
                                required
                            />
                        </div>

                        {formData.test_type !== 'TEXT_INPUT' && (
                            <div className="answer-list">
                                <h4>Answers</h4>
                                {question.answers.map((answer, answerIndex) => (
                                    <div key={answerIndex} className="answer-item">
                                        <input
                                            type="text"
                                            value={answer.text}
                                            onChange={(e) => handleAnswerChange(questionIndex, answerIndex, 'text', e.target.value)}
                                            placeholder="Answer text"
                                            required
                                        />
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={answer.is_correct}
                                                onChange={(e) => handleAnswerChange(questionIndex, answerIndex, 'is_correct', e.target.checked)}
                                            />
                                            Correct
                                        </label>
                                        <button
                                            type="button"
                                            className="remove-button"
                                            onClick={() => removeAnswer(questionIndex, answerIndex)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="add-button"
                                    onClick={() => addAnswer(questionIndex)}
                                >
                                    Add Answer
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    className="add-button"
                    onClick={addQuestion}
                >
                    Add Question
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
                type="submit"
                className="auth-button"
                disabled={loading}
            >
                {loading ? 'Saving...' : (isEditing ? 'Update Test' : 'Create Test')}
            </button>
        </form>
    );
};

export default TestForm; 