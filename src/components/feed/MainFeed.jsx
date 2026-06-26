import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreatePost from './CreatePost';
import PostItem from './PostItem';

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
                <div>
                    {posts.map(post => (
                        <PostItem key={post._id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}