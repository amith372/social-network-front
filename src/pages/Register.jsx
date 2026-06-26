import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register({ onLoginSuccess }) {
    // one object to hold all form data for username, email, and password
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false); // מצב טעינה לחוויית משתמש טובה יותר
    
    const navigate = useNavigate();

    const API_URL = 'https://social-network-backend-android2-project.onrender.com/api/users/register';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault(); 
        setErrorMsg('');
        setIsLoading(true); // set to loading state when the request starts

        try {
            // sending to server
            const response = await axios.post(API_URL, formData);

            /// saving the token to local storage for future authenticated requests
            localStorage.setItem('token', response.data.token);
            
            // update app state to reflect that the user is now logged in
            onLoginSuccess(formData.username);
            
            navigate('/');
            
        } catch (error) {
            console.error("Full Error Object:", error);

            if (error.response) {
                console.error("Server returned status:", error.response.status);
                console.error("Response Data:", error.response.data);
                setErrorMsg(error.response.data.message || "Registration failed.");
            } else if (error.request) {
                console.error("No response received from the server. Request details:", error.request);
                setErrorMsg("No response from the server, please check if it is running.");
            } else {
                console.error("Error setting up the request:", error.message);
                setErrorMsg("A general system error occurred.");
            }
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Create an Account</h2>
            
            {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

            <form onSubmit={handleRegister} style={{ display: 'inline-block', textAlign: 'left' }}>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="username">Username: </label><br />
                    <input 
                        type="text" 
                        id="username"
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="email">Email: </label><br />
                    <input 
                        type="email" 
                        id="email"
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password">Password: </label><br />
                    <input 
                        type="password" 
                        id="password"
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                {/* disable button while loading */}
                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{ 
                        width: '100%', 
                        padding: '5px', 
                        backgroundColor: isLoading ? '#6c757d' : '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: isLoading ? 'not-allowed' : 'pointer' 
                    }}
                >
                    {isLoading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
}