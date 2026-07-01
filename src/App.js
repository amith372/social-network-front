import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/Navbar';
import Register from './pages/Register';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
    // 1. Initial token check (Decodes JWT to check expiration)
    const checkTokenValidity = () => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 < Date.now()) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                return false;
            }
            return true;
        } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            return false;
        }
    };

    const [isLoggedIn, setIsLoggedIn] = useState(checkTokenValidity());
    const [username, setUsername] = useState(localStorage.getItem('username') || '');

    /*// 2. Global Axios Interceptor to catch 401/403 errors and auto-logout
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    setIsLoggedIn(false);
                    setUsername('');
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);*/

    const handleLoginSuccess = (loggedInUsername) => {
        localStorage.setItem('username', loggedInUsername);
        setUsername(loggedInUsername);
        setIsLoggedIn(true);
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        setUsername('');
    }

    const handleUpdateUsername = (newUsername) => {
        localStorage.setItem('username', newUsername);
        setUsername(newUsername);
    };

    return (
        <Router>
            {/* The Navbar will now appear on every page */}
            <Navbar isLoggedIn={isLoggedIn} username={username} onLogout={handleLogout} onUpdateUsername={handleUpdateUsername} />

            <div style={{ marginTop: '20px' }}>
                <Routes>
                    <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/register" element={<Register onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;