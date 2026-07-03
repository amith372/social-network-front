import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// 1. מקבלים את selectedGroup ו-setSelectedGroup
export default function GroupsSidebar({ selectedGroup, setSelectedGroup }) {
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // --- State של יצירת קבוצה ---
    const [isCreating, setIsCreating] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- State חדש עבור בחירת משתמשים לקבוצה ---
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    // --- State של החיפוש והטאבים ---
    const [activeTab, setActiveTab] = useState('myGroups');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const API_URL = 'https://social-network-backend-android2-project.onrender.com/api/groups';
    const USERS_API_URL = 'https://social-network-backend-android2-project.onrender.com/api/users';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [groupsRes, usersRes] = await Promise.all([
                    axios.get(`${API_URL}?myGroups=true&isGroupChat=true`, { headers }),
                    axios.get(USERS_API_URL, { headers })
                ]);

                setGroups(groupsRes.data);
                setAllUsers(usersRes.data);
            } catch (error) {
                console.error("Error fetching sidebar data:", error);
                setErrorMsg("Failed to load data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();

        const socket = io('https://social-network-backend-android2-project.onrender.com');
        socket.on('new_group', (newGroup) => {
            if (newGroup.isGroupChat === true) {
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        const myUserId = payload.id;

                        // Check if we are a member of this new group
                        const isMember = newGroup.members.some(m =>
                            (typeof m === 'object' ? m._id : m) === myUserId
                        );

                        if (isMember) {
                            setGroups(prev => {
                                if (prev.find(g => g._id === newGroup._id)) return prev;
                                return [...prev, newGroup];
                            });
                        }
                    } catch (e) {
                        console.error("Error decoding token for socket", e);
                    }
                }
            }
        });

        socket.on('update_group', (updatedGroup) => {
            if (updatedGroup.isGroupChat === true) {
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        const myUserId = payload.id;

                        const isMember = updatedGroup.members.some(m =>
                            (typeof m === 'object' ? m._id : m) === myUserId
                        );

                        if (!isMember) {
                            setGroups(prev => prev.filter(g => g._id !== updatedGroup._id));
                        } else {
                            setGroups(prev => prev.map(g => g._id === updatedGroup._id ? updatedGroup : g));
                        }
                    } catch (e) {
                        console.error("Error decoding token for socket", e);
                    }
                }
            }
        });

        socket.on('delete_group', (deletedGroupId) => {
            setGroups(prev => prev.filter(g => g._id !== deletedGroupId));
        });

        socket.on('new_user', (newUser) => {
            setAllUsers(prev => {
                if (prev.find(u => u._id === newUser._id)) return prev;
                return [...prev, newUser];
            });
        });

        socket.on('update_user', (updatedUser) => {
            setAllUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
        });

        socket.on('delete_user', (deletedUserId) => {
            setAllUsers(prev => prev.filter(u => u._id !== deletedUserId));
        });

        return () => socket.disconnect();
    }, []);

    const handleUserCheckboxChange = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');

            const response = await axios.post(API_URL,
                {
                    name: newGroupName,
                    members: selectedUsers
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const newGroup = response.data;
            setGroups((prev) => {
                if (prev.find(g => g._id === newGroup._id)) return prev;
                return [...prev, newGroup];
            });

            // 2. מעבירים את אובייקט הקבוצה החדש בשלמותו!
            setSelectedGroup(newGroup);

            setNewGroupName('');
            setSelectedUsers([]);
            setIsCreating(false);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to create group.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}?q=${searchQuery}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(response.data);
        } catch (error) {
            alert("Search failed.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div style={styles.sidebarContainer}>
            <div style={styles.tabsRow}>
                <span style={activeTab === 'myGroups' ? styles.activeTab : styles.linkTab} onClick={() => setActiveTab('myGroups')}>
                    your groups
                </span>
                <span style={activeTab === 'search' ? styles.activeTab : styles.linkTab} onClick={() => setActiveTab('search')}>
                    search group
                </span>
            </div>

            <div style={styles.innerListBox}>
                {activeTab === 'myGroups' && (
                    <>
                        <div
                            onClick={() => setSelectedGroup({ _id: "111111111111111111111111", name: "My Feed" })}
                            style={{
                                ...styles.groupItem,
                                fontWeight: selectedGroup && selectedGroup._id === "111111111111111111111111" ? 'bold' : 'normal',
                                backgroundColor: selectedGroup && selectedGroup._id === "111111111111111111111111" ? '#e6f7ff' : 'transparent',
                                marginBottom: '5px'
                            }}
                        >
                            📱 My Feed
                        </div>
                        <div
                            onClick={() => setSelectedGroup({ _id: "000000000000000000000000", name: "Public Feed" })}
                            style={{
                                ...styles.groupItem,
                                fontWeight: selectedGroup && selectedGroup._id === "000000000000000000000000" ? 'bold' : 'normal',
                                backgroundColor: selectedGroup && selectedGroup._id === "000000000000000000000000" ? '#e6f7ff' : 'transparent'
                            }}
                        >
                            🌐 Main Feed (Public)
                        </div>

                        {errorMsg && <p style={{ color: 'red', fontSize: '14px' }}>{errorMsg}</p>}

                        {isLoading ? (
                            <p style={{ color: '#777' }}>Loading...</p>
                        ) : (
                            groups.map(group => (
                                <div
                                    key={group._id}
                                    onClick={() => setSelectedGroup(group)}
                                    style={{
                                        ...styles.groupItem,
                                        fontWeight: selectedGroup && selectedGroup._id === group._id ? 'bold' : 'normal',
                                        backgroundColor: selectedGroup && selectedGroup._id === group._id ? '#e6f7ff' : 'transparent'
                                    }}
                                >
                                    - {group.name}
                                </div>
                            ))
                        )}
                    </>
                )}

                {activeTab === 'search' && (
                    <>
                        <form onSubmit={handleSearch} style={{ display: 'flex', marginBottom: '15px' }}>
                            <input
                                type="text"
                                placeholder="Find a group..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ flexGrow: 1, padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            <button type="submit" style={{ marginLeft: '5px', cursor: 'pointer' }}>🔍</button>
                        </form>

                        {isSearching ? (
                            <p style={{ color: '#777' }}>Searching...</p>
                        ) : (
                            searchResults.map(group => (
                                <div
                                    key={group._id}
                                    onClick={() => setSelectedGroup(group)}
                                    style={{
                                        ...styles.groupItem,
                                        backgroundColor: selectedGroup && selectedGroup._id === group._id ? '#e6f7ff' : '#f8f9fa',
                                        fontWeight: selectedGroup && selectedGroup._id === group._id ? 'bold' : 'normal',
                                        marginBottom: '5px'
                                    }}
                                >
                                    {group.name}
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>

            <div style={styles.footerRow}>
                {isCreating ? (
                    <form onSubmit={handleCreateGroup} style={styles.createForm}>
                        <input
                            type="text"
                            placeholder="Group name..."
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            style={styles.createInput}
                            required
                            autoFocus
                        />

                        <div style={styles.usersCheckboxContainer}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#555', textAlign: 'left' }}>Add members:</p>
                            {allUsers.map(user => (
                                <label key={user._id} style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user._id)}
                                        onChange={() => handleUserCheckboxChange(user._id)}
                                    />
                                    <span style={{ marginLeft: '5px' }}>{user.username}</span>
                                </label>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                            <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
                                {isSubmitting ? '⏳' : 'Create'}
                            </button>
                            <button type="button" onClick={() => { setIsCreating(false); setSelectedUsers([]); }} style={styles.cancelBtn}>
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <span style={styles.createBtn} onClick={() => setIsCreating(true)}>
                        create group
                    </span>
                )}
            </div>
        </div>
    );
} // <--- הוספתי את הסוגר המסולסל הזה שהיה חסר

const styles = {
    sidebarContainer: { display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', fontFamily: 'sans-serif' },
    tabsRow: { display: 'flex', justifyContent: 'space-around', marginBottom: '15px', fontWeight: 'bold', fontSize: '14px' },
    activeTab: { borderBottom: '2px solid black', paddingBottom: '2px', cursor: 'pointer' },
    linkTab: { color: '#555', cursor: 'pointer' },
    innerListBox: { border: '3px solid black', borderRadius: '25px', padding: '20px', flexGrow: 1, overflowY: 'auto', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' },
    groupItem: { padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', transition: 'background-color 0.2s', textAlign: 'left' },
    footerRow: { textAlign: 'center', fontWeight: 'bold', fontSize: '15px' },
    createBtn: { cursor: 'pointer', textDecoration: 'underline' },
    createForm: { display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #ccc', padding: '10px', borderRadius: '8px', backgroundColor: '#fff' },
    createInput: { padding: '6px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none', width: '100%', boxSizing: 'border-box' },
    usersCheckboxContainer: {
        maxHeight: '100px',
        overflowY: 'auto',
        border: '1px solid #eee',
        padding: '5px',
        borderRadius: '4px',
        backgroundColor: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '13px',
        cursor: 'pointer',
        fontWeight: 'normal',
        textAlign: 'left'
    },
    submitBtn: { backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold' },
    cancelBtn: { backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold' }
};