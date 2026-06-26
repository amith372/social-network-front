import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ isLoggedIn, username, onLogout }) {
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        onLogout(); 
        navigate('/login');
    };

    return (
        <nav style={{ backgroundColor: '#333', padding: '15px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Social Network</Link>
            </h3>
            
            <div>
                {isLoggedIn ? (
                    <div>
                        <span style={{ color: '#fff', fontWeight: 'bold', marginRight: '15px' }}>
                                Welcome, {username}!
                        </span>
                        <button onClick={handleLogoutClick} style={{ backgroundColor: '#7a91f5', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                            Logout
                        </button>
                    </div>
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