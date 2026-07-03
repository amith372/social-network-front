import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreatePost from './CreatePost';
import PostItem from './PostItem';
import MemberListModal from '../groups/MemberListModal';

import { io } from 'socket.io-client';

// 1. מקבלים את selectedGroupId כ-Prop במקום להגדיר אותו כקבוע
export default function MainFeed({ selectedGroup, setSelectedGroup }) {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [showMembers, setShowMembers] = useState(false);

    // Group editing states
    const [isEditingGroup, setIsEditingGroup] = useState(false);
    const [editGroupName, setEditGroupName] = useState('');
    const [editGroupDesc, setEditGroupDesc] = useState('');

    // Feed search states
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchAuthor, setSearchAuthor] = useState('');
    const [searchGroup, setSearchGroup] = useState('');
    const [searchStartDate, setSearchStartDate] = useState('');
    const [searchEndDate, setSearchEndDate] = useState('');

    // Parse currentUserId from token
    const token = localStorage.getItem('token');
    let currentUserId = null;
    if (token) {
        try {
            currentUserId = JSON.parse(atob(token.split('.')[1])).id;
        } catch (e) {
            console.error("Token parsing error");
        }
    }

    const isAdmin = selectedGroup && selectedGroup.admin === currentUserId;

    const API_URL = 'https://social-network-backend-android2-project.onrender.com/api/posts';

    // 3. החלק הכי חשוב כאן! 
    // ברגע שאנחנו מכניסים את selectedGroupId לתוך מערך התלויות (סוגריים מרובעים), 
    // React יריץ את fetchPosts מחדש בכל פעם שהמשתמש יחליף קבוצה!
    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            setErrorMsg('');

            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}?group=${selectedGroup._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPosts(response.data);
            } catch (error) {
                console.error("Error fetching posts:", error);
                setErrorMsg(error.response?.data?.message || "Failed to fetch posts from server.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
        setIsEditingGroup(false);

        const socket = io('https://social-network-backend-android2-project.onrender.com');

        if (selectedGroup._id === "111111111111111111111111") {
            socket.emit('join my_feed', currentUserId);
        } else {
            socket.emit('join room', selectedGroup._id);
        }

        socket.on('new_post', (newPost) => {
            setPosts((prevPosts) => {
                // Prevent duplicate posts if this user was the author and we already appended it locally
                if (prevPosts.find(p => p._id === newPost._id)) {
                    return prevPosts;
                }
                return [newPost, ...prevPosts];
            });
        });

        socket.on('update_post', (updatedPost) => {
            setPosts((prevPosts) => prevPosts.map(p => p._id === updatedPost._id ? updatedPost : p));
        });

        socket.on('delete_post', (postId) => {
            setPosts((prevPosts) => prevPosts.filter(p => p._id !== postId));
        });

        socket.on('update_group', (updatedGroup) => {
            if (selectedGroup._id === updatedGroup._id) {
                setSelectedGroup(updatedGroup);
            }
            if (selectedGroup._id === "111111111111111111111111") {
                const isMember = updatedGroup.members.some(m => (typeof m === 'object' ? m._id : m) === currentUserId);
                if (isMember) {
                    socket.emit('join room', updatedGroup._id);
                } else {
                    socket.emit('leave room', updatedGroup._id);
                }
            }
        });

        socket.on('new_group', (newGroup) => {
            if (selectedGroup._id === "111111111111111111111111") {
                const isMember = newGroup.members.some(m => (typeof m === 'object' ? m._id : m) === currentUserId);
                if (isMember) {
                    socket.emit('join room', newGroup._id);
                }
            }
        });

        socket.on('delete_group', (deletedGroupId) => {
            if (selectedGroup._id === deletedGroupId) {
                setSelectedGroup({ _id: "111111111111111111111111", name: "My Feed" });
            }
        });

        return () => {
            if (selectedGroup._id === "111111111111111111111111") {
                socket.emit('leave my_feed', currentUserId);
            } else {
                socket.emit('leave room', selectedGroup._id);
            }
            socket.disconnect();
        };
    }, [selectedGroup._id, currentUserId, setSelectedGroup]);

    const handlePublishPost = async (newContent) => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.post(API_URL,
                {
                    content: newContent,
                    group: selectedGroup._id === "111111111111111111111111" ? "000000000000000000000000" : selectedGroup._id
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const newlyCreatedPost = response.data;
            const isMyFeed = selectedGroup._id === "111111111111111111111111";
            setPosts((prevPosts) => {
                if (prevPosts.find(p => p._id === newlyCreatedPost._id)) return prevPosts;
                // Add to My Feed or if it matches the current group
                if (isMyFeed || selectedGroup._id === newlyCreatedPost.group || (selectedGroup._id === "000000000000000000000000" && newlyCreatedPost.group === "000000000000000000000000")) {
                    return [newlyCreatedPost, ...prevPosts];
                }
                return prevPosts;
            });

        } catch (error) {
            console.error("Error publishing post:", error);
            alert(error.response?.data?.message || "Failed to publish post. Please try again.");
        }
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts(prevPosts => prevPosts.map(p => p._id === updatedPost._id ? updatedPost : p));
    };

    const handlePostDelete = (postId) => {
        setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
    };

    const handleSaveGroup = async () => {
        if (!editGroupName.trim()) {
            alert("Group name cannot be empty");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`https://social-network-backend-android2-project.onrender.com/api/groups/${selectedGroup._id}`, {
                name: editGroupName,
                description: editGroupDesc
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedGroup(response.data);
            setIsEditingGroup(false);
        } catch (error) {
            console.error("Failed to update group:", error);
            alert("Failed to update group");
        }
    };

    const handleDeleteGroup = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this group?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`https://social-network-backend-android2-project.onrender.com/api/groups/${selectedGroup._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedGroup({ _id: "111111111111111111111111", name: "My Feed" });
            setIsEditingGroup(false);
        } catch (error) {
            console.error("Failed to delete group:", error);
            alert("Failed to delete group");
        }
    };

    const filteredPosts = posts.filter(post => {
        if (selectedGroup._id !== "111111111111111111111111") return true;

        if (searchKeyword && !post.content.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
        if (searchAuthor && !post.author?.username.toLowerCase().includes(searchAuthor.toLowerCase())) return false;
        if (searchGroup && !post.group?.name?.toLowerCase().includes(searchGroup.toLowerCase())) return false;

        if (searchStartDate && new Date(post.createdAt) < new Date(searchStartDate)) return false;
        if (searchEndDate && new Date(post.createdAt) > new Date(searchEndDate + "T23:59:59")) return false;

        return true;
    });

    return (
        <div style={{ position: 'relative' }}>
            {/* Header section with title and optional Members button */}
            {isEditingGroup ? (
                <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <input
                        type="text"
                        value={editGroupName}
                        onChange={(e) => setEditGroupName(e.target.value)}
                        style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
                        placeholder="Group Name"
                    />
                    <textarea
                        value={editGroupDesc}
                        onChange={(e) => setEditGroupDesc(e.target.value)}
                        style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
                        placeholder="Group Description"
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleSaveGroup} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                        <button onClick={() => setIsEditingGroup(false)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                        {selectedGroup.members && selectedGroup.members.length === 1 && (
                            <button onClick={handleDeleteGroup} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto' }}>Delete Group</button>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>
                            {selectedGroup._id === "111111111111111111111111" ? "My Feed"
                                : selectedGroup._id === "000000000000000000000000" ? "Main Feed (Public)"
                                    : selectedGroup.name}
                        </h2>
                        {selectedGroup.description && (
                            <p style={{ margin: '5px 0 0 0', color: '#555', fontSize: '14px' }}>{selectedGroup.description}</p>
                        )}
                    </div>
                    {selectedGroup._id !== "000000000000000000000000" && selectedGroup.isGroupChat && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        setEditGroupName(selectedGroup.name);
                                        setEditGroupDesc(selectedGroup.description || '');
                                        setIsEditingGroup(true);
                                    }}
                                    style={{ backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Edit Group
                                </button>
                            )}
                            <button
                                onClick={() => setShowMembers(true)}
                                style={{ backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                View Members
                            </button>
                        </div>
                    )}
                </div>
            )}

            {selectedGroup._id !== "111111111111111111111111" && !selectedGroup.isDeletedUserChat && (
                <CreatePost onPublish={handlePublishPost} />
            )}

            {selectedGroup.isDeletedUserChat && (
                <div style={{ textAlign: 'center', padding: '15px', color: '#777', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '15px' }}>
                    <p style={{ margin: 0, fontStyle: 'italic' }}>You cannot send messages to a deleted user.</p>
                </div>
            )}

            {selectedGroup._id === "111111111111111111111111" && (
                <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '10px', border: '1px solid #e0e0e0' }}>
                    <h4 style={{ margin: '0 0 5px 0', width: '100%', color: '#333' }}>Search Feed</h4>
                    <input type="text" placeholder="Search message..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: '1 1 150px' }} />
                    <input type="text" placeholder="Search author..." value={searchAuthor} onChange={e => setSearchAuthor(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: '1 1 150px' }} />
                    <input type="text" placeholder="Search group..." value={searchGroup} onChange={e => setSearchGroup(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: '1 1 150px' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: '1 1 200px' }}>
                        <label style={{ fontSize: '12px', color: '#555' }}>From:</label>
                        <input type="date" value={searchStartDate} onChange={e => setSearchStartDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: '1 1 200px' }}>
                        <label style={{ fontSize: '12px', color: '#555' }}>To:</label>
                        <input type="date" value={searchEndDate} onChange={e => setSearchEndDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }} />
                    </div>
                </div>
            )}

            {errorMsg && <p style={{ color: 'red', textAlign: 'center' }}>{errorMsg}</p>}

            {isLoading ? (
                <p style={{ textAlign: 'center' }}>Loading posts...</p>
            ) : filteredPosts.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#777' }}>No posts to show. Be the first to post!</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                    {filteredPosts.map(post => (
                        <PostItem
                            key={post._id}
                            post={post}
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                            onPostUpdate={handlePostUpdate}
                            onPostDelete={handlePostDelete}
                        />
                    ))}
                </div>
            )}

            {showMembers && (
                <MemberListModal
                    group={selectedGroup}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    onClose={() => setShowMembers(false)}
                    onGroupUpdate={setSelectedGroup}
                />
            )}
        </div>
    );
}