import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Register from './components/Register';
import Home from './components/Home';
import Login from './components/Login';

function App() {
    return (
        <Router>
            {/* The Navbar will now appear on every page */}
            <Navbar />
            
            <div style={{ marginTop: '20px' }}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Home />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;