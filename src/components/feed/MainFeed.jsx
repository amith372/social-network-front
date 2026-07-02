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

    const fetchPosts = async () => {
        setIsLoading(true);
        setErrorMsg('');

        try {
            const token = localStorage.getItem('token');

            // 2. משתמשים ב-Prop הדינמי כדי למשוך את הפוסטים של הקבוצה הספציפית
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

    // 3. החלק הכי חשוב כאן! 
    // ברגע שאנחנו מכניסים את selectedGroupId לתוך מערך התלויות (סוגריים מרובעים), 
    // React יריץ את fetchPosts מחדש בכל פעם שהמשתמש יחליף קבוצה!
    useEffect(() => {
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
        });

        return () => {
            if (selectedGroup._id === "111111111111111111111111") {
                socket.emit('leave my_feed', currentUserId);
            } else {
                socket.emit('leave room', selectedGroup._id);
            }
            socket.disconnect();
        };
    }, [selectedGroup._id]);

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

            {errorMsg && <p style={{ color: 'red', textAlign: 'center' }}>{errorMsg}</p>}

            {isLoading ? (
                <p style={{ textAlign: 'center' }}>Loading posts...</p>
            ) : posts.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#777' }}>No posts to show. Be the first to post!</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                    {posts.map(post => (
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