import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MemberListModal({ group, currentUserId, isAdmin, onClose, onGroupUpdate }) {
    const [members, setMembers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [joinRequests, setJoinRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNewUser, setSelectedNewUser] = useState('');

    const USERS_API_URL = 'https://social-network-backend-android2-project.onrender.com/api/users';
    const GROUPS_API_URL = 'https://social-network-backend-android2-project.onrender.com/api/groups';

    useEffect(() => {
        // Fetch all users and categorize them based on group membership and join requests
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const res = await axios.get(USERS_API_URL, { headers });

                // Add the current user to the data pool since they are excluded from the API response
                const currentUsername = localStorage.getItem('username');
                if (currentUserId && currentUsername) {
                    res.data.push({ _id: currentUserId, username: currentUsername });
                }

                // Group members array might contain IDs or populated objects. We need their IDs to filter correctly.
                const memberIds = (group.members || []).map(m => typeof m === 'object' ? m._id : m);
                const requestIds = (group.joinRequests || []).map(r => typeof r === 'object' ? r._id : r);

                // Categorize users into current members, pending requests, and non-members
                const groupMembers = res.data.filter(u => memberIds.includes(u._id));
                const joinRequestUsers = res.data.filter(u => requestIds.includes(u._id));
                const nonMembers = res.data.filter(u => !memberIds.includes(u._id) && !requestIds.includes(u._id));

                setMembers(groupMembers);
                setJoinRequests(joinRequestUsers);
                setAllUsers(nonMembers);
            } catch (err) {
                console.error("Failed to fetch users", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, [group, currentUserId]);

    // Remove a specific member from the group
    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Current members minus the one we remove
            const updatedMemberIds = members.filter(m => m._id !== userId).map(m => m._id);

            await axios.put(`${GROUPS_API_URL}/${group._id}`, { members: updatedMemberIds }, { headers });

            // Update local state to reflect the removed member
            const removedUser = members.find(m => m._id === userId);
            setMembers(members.filter(m => m._id !== userId));
            if (removedUser) {
                setAllUsers([...allUsers, removedUser]);
            }
            if (onGroupUpdate) {
                onGroupUpdate({ ...group, members: updatedMemberIds });
            }
        } catch (err) {
            console.error("Failed to remove member", err);
            alert("Failed to remove member");
        }
    };

    // Add a selected non member to the group
    const handleAddMember = async () => {
        if (!selectedNewUser) return;
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const updatedMemberIds = [...members.map(m => m._id), selectedNewUser];

            await axios.put(`${GROUPS_API_URL}/${group._id}`, { members: updatedMemberIds }, { headers });

            // Update local state to reflect the newly added member
            const addedUser = allUsers.find(u => u._id === selectedNewUser);
            if (addedUser) {
                setMembers([...members, addedUser]);
                setAllUsers(allUsers.filter(u => u._id !== selectedNewUser));
            }
            if (onGroupUpdate) {
                onGroupUpdate({ ...group, members: updatedMemberIds });
            }
            setSelectedNewUser('');
        } catch (err) {
            console.error("Failed to add member", err);
            alert("Failed to add member");
        }
    };

    // Allow the current user to leave the group
    const handleLeaveGroup = async () => {
        if (!window.confirm("Are you sure you want to leave this group?")) return;
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            await axios.patch(`${GROUPS_API_URL}/${group._id}/leave`, {}, { headers });

            if (onGroupUpdate) {
                // If the user leaves, we might want to fallback to the default feed
                onGroupUpdate({ _id: "111111111111111111111111", name: "My Feed" });
            }
            onClose();
        } catch (err) {
            console.error("Failed to leave group", err);
            alert(err.response?.data?.message || "Failed to leave group");
        }
    };

    // Accept a users request to join the group
    const handleAcceptRequest = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.post(`${GROUPS_API_URL}/${group._id}/accept-join`, { userId }, { headers });

            const acceptedUser = joinRequests.find(u => u._id === userId);
            setJoinRequests(joinRequests.filter(u => u._id !== userId));
            if (acceptedUser) {
                setMembers([...members, acceptedUser]);
            }
        } catch (err) {
            console.error("Failed to accept request", err);
            alert("Failed to accept request");
        }
    };

    // Reject a users request to join the group
    const handleRejectRequest = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.post(`${GROUPS_API_URL}/${group._id}/reject-join`, { userId }, { headers });

            const rejectedUser = joinRequests.find(u => u._id === userId);
            setJoinRequests(joinRequests.filter(u => u._id !== userId));
            if (rejectedUser) {
                setAllUsers([...allUsers, rejectedUser]);
            }
        } catch (err) {
            console.error("Failed to reject request", err);
            alert("Failed to reject request");
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h3 style={{ margin: 0 }}>{group.name} - Members</h3>
                    <button onClick={onClose} style={styles.closeBtn}>X</button>
                </div>

                {isLoading ? (
                    <p>Loading members...</p>
                ) : (
                    <div style={styles.content}>
                        <ul style={styles.memberList}>
                            {members.map(member => (
                                <li key={member._id} style={styles.memberItem}>
                                    <span>{member.username} {group.admin === member._id ? '(Admin)' : ''}</span>
                                    {isAdmin && member._id !== currentUserId && (
                                        <button onClick={() => handleRemoveMember(member._id)} style={styles.removeBtn}>Remove</button>
                                    )}
                                    {member._id === currentUserId && (
                                        <button onClick={handleLeaveGroup} style={styles.leaveBtn}>Leave Group</button>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {isAdmin && joinRequests.length > 0 && (
                            <div style={{ marginTop: '20px', borderTop: '2px solid #333', paddingTop: '10px' }}>
                                <h4 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>requests</h4>
                                <ul style={styles.memberList}>
                                    {joinRequests.map(user => (
                                        <li key={user._id} style={styles.memberItem}>
                                            <span>{user.username}</span>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button onClick={() => handleAcceptRequest(user._id)} style={{ ...styles.acceptBtn, fontWeight: 'bold' }}>V</button>
                                                <button onClick={() => handleRejectRequest(user._id)} style={{ ...styles.removeBtn, fontWeight: 'bold' }}>X</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {isAdmin && (
                            <div style={styles.addSection}>
                                <h4 style={{ margin: '0 0 10px 0' }}>Add New Member</h4>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <select
                                        value={selectedNewUser}
                                        onChange={(e) => setSelectedNewUser(e.target.value)}
                                        style={{ flex: 1, padding: '5px' }}
                                    >
                                        <option value="">Select a user...</option>
                                        {allUsers.map(user => (
                                            <option key={user._id} value={user._id}>{user.username}</option>
                                        ))}
                                    </select>
                                    <button onClick={handleAddMember} disabled={!selectedNewUser} style={styles.addBtn}>Add</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '400px',
        maxWidth: '90%',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px',
        marginBottom: '10px'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '18px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    memberList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        maxHeight: '200px',
        overflowY: 'auto'
    },
    memberItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid #eee'
    },
    removeBtn: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '4px 8px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    acceptBtn: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '4px 8px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    rejectBtn: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '4px 8px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    leaveBtn: {
        backgroundColor: '#ffc107',
        color: 'black',
        border: 'none',
        padding: '4px 8px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    addSection: {
        borderTop: '1px solid #eee',
        paddingTop: '10px'
    },
    addBtn: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};
