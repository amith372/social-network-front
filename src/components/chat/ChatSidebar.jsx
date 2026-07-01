import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function ChatSidebar({ selectedGroup, setSelectedGroup }) {
    const [privateChats, setPrivateChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // --- State for creating private chat ---
    const [allUsers, setAllUsers] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedUser, setSelectedUser] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Search states
    const [searchUsername, setSearchUsername] = useState('');
    const [searchAge, setSearchAge] = useState('');
    const [searchLanguage, setSearchLanguage] = useState('');
    const [searchGender, setSearchGender] = useState('');
    const [languages, setLanguages] = useState([]);

    const API_URL = 'https://social-network-backend-android2-project.onrender.com/api/groups';
    const USERS_API_URL = 'https://social-network-backend-android2-project.onrender.com/api/users';

    const getChatDisplayName = (chat, fetchedUsers, currentUsername) => {
        const memberIds = (chat?.members || []).map(m => typeof m === 'object' ? m._id : m);

        for (const id of memberIds) {
            const user = fetchedUsers.find(u => u._id === id);
            if (user && user.username && user.username !== currentUsername) {
                return user.username;
            }
        }

        return 'Deleted Chat';
    };

    useEffect(() => {
        const fetchPrivateChats = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch all groups user is part of, AND fetch all users
                const [groupsRes, usersRes, langRes] = await Promise.all([
                    axios.get(`${API_URL}?myGroups=true`, { headers }),
                    axios.get(USERS_API_URL, { headers }),
                    axios.get('https://libretranslate.com/languages').catch(() => ({ data: [] }))
                ]);

                const fetchedUsers = usersRes.data;
                setAllUsers(fetchedUsers);
                if (langRes && langRes.data) {
                    setLanguages(langRes.data);
                }

                // Filter groups to ONLY those where isGroupChat is false
                const pChats = groupsRes.data.filter(g => g.isGroupChat === false);

                const currentUsername = localStorage.getItem('username');

                // Map members array to actual usernames
                const processedChats = pChats.map(chat => ({
                    ...chat,
                    name: getChatDisplayName(chat, fetchedUsers, currentUsername)
                }));

                setPrivateChats(processedChats);
            } catch (err) {
                console.error("Error fetching private chats", err);
                setErrorMsg("Failed to load private chats");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrivateChats();

        const socket = io('https://social-network-backend-android2-project.onrender.com');
        socket.on('new_group', (newGroup) => {
            if (newGroup.isGroupChat === false) {
                const token = localStorage.getItem('token');
                const currentUsername = localStorage.getItem('username');

                if (token && currentUsername) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        const myUserId = payload.id;

                        const isMember = newGroup.members.some(m =>
                            (typeof m === 'object' ? m._id : m) === myUserId
                        );

                        if (isMember) {
                            setPrivateChats(prev => {
                                if (prev.find(c => c._id === newGroup._id)) return prev;

                                const chatToAdd = {
                                    ...newGroup,
                                    name: getChatDisplayName(newGroup, [], currentUsername)
                                };
                                return [...prev, chatToAdd];
                            });
                        }
                    } catch (e) {
                        console.error("Error decoding token for socket", e);
                    }
                }
            }
        });

        return () => socket.disconnect();
    }, []);

    const handleStartPrivateChat = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/private`,
                { targetUserId: selectedUser },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const newChat = res.data;
            const currentUsername = localStorage.getItem('username');

            newChat.name = getChatDisplayName(newChat, allUsers, currentUsername);

            // Add to list if not already there
            setPrivateChats(prev => {
                const exists = prev.find(c => c._id === newChat._id);
                if (exists) return prev;
                return [...prev, newChat];
            });

            setSelectedGroup(newChat);
            setSelectedUser('');
            setIsCreating(false);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to start private chat.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const styles = {
        sidebarContainer: { display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif', justifyContent: 'space-between' },
        header: { textAlign: 'center', marginBottom: '15px', fontWeight: 'bold', fontSize: '18px' },
        innerListBox: { border: '3px solid black', borderRadius: '25px', padding: '20px', flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' },
        chatItem: { padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', transition: 'background-color 0.2s', textAlign: 'left' },
        footerRow: { textAlign: 'center', fontWeight: 'bold', fontSize: '15px' },
        createBtn: { cursor: 'pointer', textDecoration: 'underline' },
        createForm: { display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #ccc', padding: '10px', borderRadius: '8px', backgroundColor: '#fff' },
        createInput: { padding: '6px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none', width: '100%', boxSizing: 'border-box' },
        submitBtn: { backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold' },
        cancelBtn: { backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold' }
    };

    const currentUsername = localStorage.getItem('username');

    return (
        <div style={styles.sidebarContainer}>
            <div style={styles.header}>
                private chats
            </div>

            <div style={styles.innerListBox}>
                {errorMsg && <p style={{ color: 'red', fontSize: '14px' }}>{errorMsg}</p>}

                {isLoading ? (
                    <p style={{ color: '#777' }}>Loading...</p>
                ) : privateChats.length === 0 ? (
                    <p style={{ color: '#777', fontSize: '14px' }}>No private chats yet.</p>
                ) : (
                    privateChats.map(chat => (
                        <div
                            key={chat._id}
                            onClick={() => setSelectedGroup(chat)}
                            style={{
                                ...styles.chatItem,
                                fontWeight: selectedGroup && selectedGroup._id === chat._id ? 'bold' : 'normal',
                                backgroundColor: selectedGroup && selectedGroup._id === chat._id ? '#e6f7ff' : 'transparent'
                            }}
                        >
                            💬 {chat.name}
                        </div>
                    ))
                )}
            </div>

            <div style={styles.footerRow}>
                {isCreating ? (
                    <form onSubmit={handleStartPrivateChat} style={styles.createForm}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#555', textAlign: 'left' }}>Search criteria (All apply):</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '5px' }}>
                            <input
                                type="text"
                                value={searchUsername}
                                onChange={(e) => setSearchUsername(e.target.value)}
                                placeholder="Username..."
                                style={{ ...styles.createInput, padding: '4px', fontSize: '12px' }}
                            />
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input
                                    type="number"
                                    min="0"
                                    value={searchAge}
                                    onChange={(e) => setSearchAge(e.target.value)}
                                    placeholder="Age..."
                                    style={{ ...styles.createInput, flex: 1, padding: '4px', fontSize: '12px' }}
                                />
                                <select
                                    value={searchGender}
                                    onChange={(e) => setSearchGender(e.target.value)}
                                    style={{ ...styles.createInput, flex: 1, padding: '4px', fontSize: '12px' }}
                                >
                                    <option value="">Any Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>
                            <select
                                value={searchLanguage}
                                onChange={(e) => setSearchLanguage(e.target.value)}
                                style={{ ...styles.createInput, padding: '4px', fontSize: '12px' }}
                            >
                                <option value="">Any Language</option>
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>
                        </div>

                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            style={styles.createInput}
                            required
                        >
                            <option value="" disabled>Select a user...</option>
                            {allUsers
                                .filter(u => {
                                    // 1. Exclude self
                                    if (u.username === currentUsername) return false;

                                    // 2. Exclude users we already have a private chat with
                                    const hasExistingChat = privateChats.some(chat =>
                                        chat.members.some(m => {
                                            const idStr = typeof m === 'object' ? m._id : m;
                                            return idStr === u._id;
                                        })
                                    );
                                    if (hasExistingChat) return false;

                                    // 3. Apply all search filters
                                    if (searchUsername.trim() !== '') {
                                        if (!u.username || !u.username.toLowerCase().includes(searchUsername.toLowerCase().trim())) return false;
                                    }
                                    if (searchAge.trim() !== '') {
                                        if (u.age === undefined || u.age === null || u.age.toString() !== searchAge.trim()) return false;
                                    }
                                    if (searchGender.trim() !== '') {
                                        if (!u.gender || u.gender.toLowerCase() !== searchGender.toLowerCase().trim()) return false;
                                    }
                                    if (searchLanguage.trim() !== '') {
                                        const searchLangLower = searchLanguage.toLowerCase().trim();
                                        if (Array.isArray(u.language)) {
                                            if (!u.language.some(lang => lang.toLowerCase() === searchLangLower)) return false;
                                        } else {
                                            if (!u.language || u.language.toLowerCase() !== searchLangLower) return false;
                                        }
                                    }

                                    return true;
                                })
                                .map(user => (
                                    <option key={user._id} value={user._id}>{user.username}</option>
                                ))
                            }
                        </select>

                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '5px' }}>
                            <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
                                {isSubmitting ? '⏳' : 'Start'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreating(false);
                                    setSelectedUser('');
                                    setSearchUsername('');
                                    setSearchAge('');
                                    setSearchLanguage('');
                                    setSearchGender('');
                                }}
                                style={styles.cancelBtn}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <span style={styles.createBtn} onClick={() => setIsCreating(true)}>
                        start private chat
                    </span>
                )}
            </div>
        </div>
    );
}