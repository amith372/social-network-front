import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        // Clear the token from memory
        localStorage.removeItem('token');
        // Redirect to login page
        navigate('/login');
    };

    return (
        <nav style={{ backgroundColor: '#333', padding: '15px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Social Network</Link>
            </h3>
            
            <div>
                {token ? (
                    // Buttons to show when logged in
                    <button onClick={handleLogout} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                        Logout
                    </button>
                ) : (
                    // Buttons to show when NOT logged in
                    <>
                        <Link to="/login" style={{ color: 'white', textDecoration: 'none', marginRight: '15px' }}>Login</Link>
                        <Link to="/register" style={{ backgroundColor: '#28a745', color: 'white', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}