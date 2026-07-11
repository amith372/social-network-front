import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Register from './pages/Register';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
    // Initial token check (Decodes JWT to check expiration)
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

    const handleLoginSuccess = (loggedInUsername, token) => {
        if (token) {
            localStorage.setItem('token', token);
        }
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
                    <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/register" element={isLoggedIn ? <Navigate to="/" replace /> : <Register onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;