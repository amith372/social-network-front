import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    const navigate = useNavigate();

    // Make sure to use your live Render URL here as well!
    const API_URL = 'https://social-network-backend-android2-project.onrender.com/api/users/register';

    const handleRegister = async (e) => {
        e.preventDefault(); 
        
        try {
            const response = await axios.post(API_URL, {
                username: username,
                email: email,
                password: password
            });

            // Save the token and log the user in immediately after registering
            localStorage.setItem('token', response.data.token);
            navigate('/');
            
            // Force a page reload so the Navbar updates to show the "Logout" button
            window.location.reload();
            
        } catch (error) {
            if (error.response) {
                setErrorMsg(error.response.data.message);
            } else {
                setErrorMsg("Server connection failed");
            }
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Create an Account</h2>
            
            {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

            <form onSubmit={handleRegister} style={{ display: 'inline-block', textAlign: 'left' }}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Username: </label><br />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Email: </label><br />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password: </label><br />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" style={{ width: '100%', padding: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Register
                </button>
            </form>
        </div>
    );
}