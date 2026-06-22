import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import our page components
import Register from './pages/Register';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Main Application Route */}
                <Route path="/" element={<Home />} />

                {/* Catch-all route: redirect any unknown URL back to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;