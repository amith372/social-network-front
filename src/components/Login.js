/*import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    const navigate = useNavigate();

    // The live Render URL for the login endpoint
    const API_URL = 'https://social-network-backend-android2-project.onrender.com/api/users/login';

    const handleLogin = async (e) => {
        e.preventDefault(); 
        setErrorMsg('');
        
        try {
            const response = await axios.post(API_URL, {
                email: email,
                password: password
            });

            // Save the token to local storage
            localStorage.setItem('token', response.data.token);
            
            // Navigate to the main feed
            navigate('/');
            
            // Force a page reload so the Navbar updates to show the "Logout" button
            window.location.reload();
            
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
        }
    };
    

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Login to Social Network</h2>
            
            {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

            <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'left' }}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Email: </label><br />
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password: </label><br />
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Login
                </button>
            </form>
        </div>
    );
}*/