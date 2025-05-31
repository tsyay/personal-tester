import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Learning from './pages/Learning';
import Tests from './pages/Tests';
import Profile from './pages/Profile';
import Login from './components/Login';
import Articles from './pages/Articles';
import ArticleView from './pages/ArticleView';
import Courses from './pages/Courses';
import CreateCourse from './pages/CreateCourse';
import CourseView from './pages/CourseView';
import TestTaking from './pages/TestTaking';
import TestResults from './pages/TestResults';
import TestCreate from './pages/TestCreate';
import UsersManagement from './pages/UsersManagement';
import UserCreate from './pages/UserCreate';
import { UserProvider } from './context/UserContext';
import './styles/main.css';

function App() {
    return (
        <UserProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <Header />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/learning" element={<Learning />} />
                        <Route path="/tests" element={<Tests />} />
                        <Route path="/tests/create" element={<TestCreate />} />
                        <Route path="/tests/:testId/take" element={<TestTaking />} />
                        <Route path="/tests/:testId/results" element={<TestResults />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/articles" element={<Articles />} />
                        <Route path="/articles/:id" element={<ArticleView />} />
                        <Route path="/articles/create" element={<Articles />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/courses/create" element={<CreateCourse />} />
                        <Route path="/courses/:id" element={<CourseView />} />
                        <Route path="/users" element={<UsersManagement />} />
                        <Route path="/users/create" element={<UserCreate />} />
                    </Routes>
                </div>
            </Router>
        </UserProvider>
    );
}

export default App;
