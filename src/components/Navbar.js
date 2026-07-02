import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Navbar({ isLoggedIn, username, onLogout, onUpdateUsername }) {
    const navigate = useNavigate();

    const [activeModal, setActiveModal] = useState(null); // 'updateProfile', 'changePassword', 'deleteAccount'
    const [languages, setLanguages] = useState([]);

    // Forms state
    const [profileData, setProfileData] = useState({ username: '', gender: 'Prefer not to say', spokenLanguages: [] });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [deleteData, setDeleteData] = useState({ password: '' });

    const [msg, setMsg] = useState({ text: '', type: '' }); // type: 'error' or 'success'

    const USERS_API_URL = 'https://social-network-backend-android2-project.onrender.com/api/users';

    useEffect(() => {
        if (activeModal === 'updateProfile') {
            const fetchLanguages = async () => {
                try {
                    const res = await axios.get('https://libretranslate.com/languages');
                    setLanguages(res.data);
                } catch (err) {
                    console.error('Failed to fetch languages', err);
                }
            };
            fetchLanguages();
        }
        // Reset messages when modal changes
        setMsg({ text: '', type: '' });
    }, [activeModal]);

    const handleLogoutClick = () => {
        onLogout();
        navigate('/login');
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setMsg({ text: '', type: '' });
        try {
            const token = localStorage.getItem('token');
            const dataToUpdate = {};
            if (profileData.username.trim()) dataToUpdate.username = profileData.username;
            if (profileData.gender) dataToUpdate.gender = profileData.gender;
            if (profileData.spokenLanguages.length > 0) dataToUpdate.language = profileData.spokenLanguages;

            const res = await axios.put(`${USERS_API_URL}/me`, dataToUpdate, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMsg({ text: res.data.message || 'Profile updated!', type: 'success' });
            if (res.data.user && res.data.user.username) {
                if (onUpdateUsername) onUpdateUsername(res.data.user.username);
            }
            setTimeout(() => setActiveModal(null), 1500);
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Error updating profile', type: 'error' });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMsg({ text: '', type: '' });
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${USERS_API_URL}/change-password`, passwordData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMsg({ text: res.data.message || 'Password changed!', type: 'success' });
            setTimeout(() => {
                setActiveModal(null);
                setPasswordData({ currentPassword: '', newPassword: '' });
            }, 1500);
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Error changing password', type: 'error' });
        }
    };

    const handleDeleteSubmit = async (e) => {
        e.preventDefault();
        setMsg({ text: '', type: '' });
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${USERS_API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` },
                data: deleteData // Axios delete expects body in `data` field
            });

            setMsg({ text: res.data.message || 'Account deleted!', type: 'success' });

            if (typeof onLogout === 'function') {
                onLogout();
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
            }

            setTimeout(() => {
                setActiveModal(null);
                navigate('/login');
            }, 1000);
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Error deleting account', type: 'error' });
        }
    };

    const modalStyle = {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    };
    const modalContentStyle = {
        backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '300px', color: 'black'
    };
    const inputStyle = { width: '100%', marginBottom: '10px', padding: '5px', boxSizing: 'border-box' };
    const btnStyle = { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px', cursor: 'pointer', width: '100%' };

    return (
        <>
            <nav style={{ backgroundColor: '#333', padding: '15px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Social Network</Link>
                </h3>

                <div>
                    {isLoggedIn ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>
                                Welcome, {username}!
                            </span>
                            <button onClick={() => setActiveModal('updateProfile')} style={{ backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                Update Profile
                            </button>
                            <button onClick={() => setActiveModal('changePassword')} style={{ backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                Change Password
                            </button>
                            <button onClick={() => setActiveModal('deleteAccount')} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                Delete Account
                            </button>
                            <button onClick={handleLogoutClick} style={{ backgroundColor: '#7a91f5', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' }}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: 'white', textDecoration: 'none', marginRight: '15px' }}>Login</Link>
                            <Link to="/register" style={{ backgroundColor: '#28a745', color: 'white', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px' }}>Register</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Modals */}
            {activeModal === 'updateProfile' && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h4>Update Profile</h4>
                        {msg.text && <p style={{ color: msg.type === 'error' ? 'red' : 'green', fontSize: '13px' }}>{msg.text}</p>}
                        <form onSubmit={handleProfileSubmit}>
                            <label style={{ fontSize: '13px' }}>Username (leave blank to keep):</label>
                            <input type="text" style={inputStyle} value={profileData.username} onChange={e => setProfileData({ ...profileData, username: e.target.value })} />
                            <label style={{ fontSize: '13px' }}>Gender:</label>
                            <select style={inputStyle} value={profileData.gender} onChange={e => setProfileData({ ...profileData, gender: e.target.value })}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>

                            <label style={{ fontSize: '13px' }}>Languages:</label>
                            <select multiple style={{ ...inputStyle, height: '80px' }} value={profileData.spokenLanguages} onChange={e => {
                                const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                                setProfileData({ ...profileData, spokenLanguages: selected });
                            }}>
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>

                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button type="submit" style={btnStyle}>Save</button>
                                <button type="button" onClick={() => setActiveModal(null)} style={{ ...btnStyle, backgroundColor: '#6c757d' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeModal === 'changePassword' && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h4>Change Password</h4>
                        {msg.text && <p style={{ color: msg.type === 'error' ? 'red' : 'green', fontSize: '13px' }}>{msg.text}</p>}
                        <form onSubmit={handlePasswordSubmit}>
                            <label style={{ fontSize: '13px' }}>Current Password:</label>
                            <input type="password" style={inputStyle} value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required />

                            <label style={{ fontSize: '13px' }}>New Password:</label>
                            <input type="password" style={inputStyle} value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} required />

                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button type="submit" style={btnStyle}>Update</button>
                                <button type="button" onClick={() => setActiveModal(null)} style={{ ...btnStyle, backgroundColor: '#6c757d' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeModal === 'deleteAccount' && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h4 style={{ color: 'red' }}>Delete Account</h4>
                        <p style={{ fontSize: '12px' }}>Warning: This action cannot be undone.</p>
                        {msg.text && <p style={{ color: msg.type === 'error' ? 'red' : 'green', fontSize: '13px' }}>{msg.text}</p>}
                        <form onSubmit={handleDeleteSubmit}>
                            <label style={{ fontSize: '13px' }}>Confirm with Password:</label>
                            <input type="password" style={inputStyle} value={deleteData.password} onChange={e => setDeleteData({ ...deleteData, password: e.target.value })} required />

                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button type="submit" style={{ ...btnStyle, backgroundColor: '#dc3545' }}>Delete</button>
                                <button type="button" onClick={() => setActiveModal(null)} style={{ ...btnStyle, backgroundColor: '#6c757d' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}