import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import TestList from './components/TestList';
import TestCreation from './components/TestCreation';
import TestView from './components/TestView';
import TestEdit from './components/TestEdit';
import TestTaking from './components/TestTaking';
import TestResults from './components/TestResults';
import ArticleList from './components/ArticleList';
import ArticleView from './components/ArticleView';
import ArticleEditor from './components/ArticleEditor';
import UserManagement from './components/UserManagement';
import Profile from './components/Profile';
import ArticleCreate from './components/ArticleCreate';
import TestCreate from './components/TestCreate';
import './styles/App.css';

// Add axios interceptor for token refresh
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't tried to refresh the token yet
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post('http://localhost:8000/api/students/login/refresh/', {
                    refresh: refreshToken
                });

                const { access } = response.data;
                localStorage.setItem('access_token', access);

                // Update the original request with the new token
                originalRequest.headers['Authorization'] = `Bearer ${access}`;
                return axios(originalRequest);
            } catch (refreshError) {
                // If refresh token is invalid, redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Set default axios headers
const token = localStorage.getItem('access_token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function App() {
    return (
        <Router>
            <div className="app">
                <Header />
                <main className="main-content">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/tests" element={<TestList />} />
                        <Route path="/tests/create" element={<TestCreate />} />
                        <Route path="/tests/:testId" element={<TestView />} />
                        <Route path="/tests/:testId/edit" element={<TestEdit />} />
                        <Route path="/tests/:testId/take" element={<TestTaking />} />
                        <Route path="/tests/:testId/results" element={<TestResults />} />
                        <Route path="/articles" element={<ArticleList />} />
                        <Route path="/articles/create" element={<ArticleCreate />} />
                        <Route path="/articles/:id/edit" element={<ArticleEditor />} />
                        <Route path="/articles/:id" element={<ArticleView />} />
                        <Route path="/users" element={<UserManagement />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
