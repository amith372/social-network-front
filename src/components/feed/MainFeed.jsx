import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreatePost from './CreatePost';
import PostItem from './PostItem';

import { io } from 'socket.io-client';

// 1. מקבלים את selectedGroupId כ-Prop במקום להגדיר אותו כקבוע
export default function MainFeed({ selectedGroup }) {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

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

        const socket = io('https://social-network-backend-android2-project.onrender.com');

        socket.emit('join room', selectedGroup._id);

        socket.on('new_post', (newPost) => {
            setPosts((prevPosts) => {
                // Prevent duplicate posts if this user was the author and we already appended it locally
                if (prevPosts.find(p => p._id === newPost._id)) {
                    return prevPosts;
                }
                return [newPost, ...prevPosts];
            });
        });

        return () => {
            socket.emit('leave room', selectedGroup._id);
            socket.disconnect();
        };
    }, [selectedGroup._id]); 

    const handlePublishPost = async (newContent) => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.post(API_URL, 
                { 
                    content: newContent,
                    // 4. משייך את הפוסט החדש לקבוצה שהמשתמש מסתכל עליה כרגע
                    group: selectedGroup._id 
                }, 
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const newlyCreatedPost = response.data;
            setPosts((prevPosts) => [newlyCreatedPost, ...prevPosts]);
            
        } catch (error) {
            console.error("Error publishing post:", error);
            alert(error.response?.data?.message || "Failed to publish post. Please try again.");
        }
    };

    return (
        <div>
            {/* אפשר גם להציג אינדיקציה שהמשתמש נמצא בקבוצת הדיפולט או קבוצה אחרת */}
            <h2 style={{ marginTop: 0 }}>
                {selectedGroup._id === "000000000000000000000000" ? "Main Feed (Public)" : "Group Feed - " + selectedGroup.name}
            </h2>
            
            <CreatePost onPublish={handlePublishPost} />
            
            {errorMsg && <p style={{ color: 'red', textAlign: 'center' }}>{errorMsg}</p>}
            
            {isLoading ? (
                <p style={{ textAlign: 'center' }}>Loading posts...</p>
            ) : posts.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#777' }}>No posts to show. Be the first to post!</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                    {posts.map(post => (
                        <PostItem key={post._id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}