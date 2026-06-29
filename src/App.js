import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Register from './pages/Register';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

    const [username, setUsername] = useState(localStorage.getItem('username') || '');

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