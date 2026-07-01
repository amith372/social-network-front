import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLoginSuccess }) {
    // hold information for both email and password in a single state object
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false); 
    
    const navigate = useNavigate();


    const API_URL = 'https://social-network-backend-android2-project.onrender.com/api/users/login';

    // update the formData state based on the input field's name and value
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault(); 
        setErrorMsg('');
        setIsLoading(true); // turn on loading state when the request starts
        
        try {
            // send the formData object directly to the server
            const response = await axios.post(API_URL, formData);

            // saving the token to local storage for future authenticated requests
            localStorage.setItem('token', response.data.token);
            const fetchedUsername = response.data.user.username || "User";
            
            onLoginSuccess(fetchedUsername, response.data.token);
            navigate('/', { replace: true });
            
        } catch (error) {
            console.error("Full Error Object:", error);

            if (error.response) {
                console.error("Server returned status:", error.response.status);
                console.error("Response Data:", error.response.data);
                setErrorMsg(error.response.data.message || "Invalid login credentials.");
            } else if (error.request) {
                console.error("No response received from the server. Request details:", error.request);
                setErrorMsg("No response from the server, please check if it is running.");
            } else {
                console.error("Error setting up the request:", error.message);
                setErrorMsg("A general system error occurred.");
            }
        } finally {
            setIsLoading(false); // turn off loading state when the request finishes
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Login to Social Network</h2>
            
            {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

            <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'left' }}>
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
                
                {/* disbales button upon login */}
                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{ 
                        width: '100%', 
                        padding: '5px', 
                        backgroundColor: isLoading ? '#6c757d' : '#007bff',
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: isLoading ? 'not-allowed' : 'pointer' 
                    }}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}