import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();
    const [newPostContent, setNewPostContent] = useState('');

    useEffect(() => {
        // 1. Retrieve the token from the browser's local storage
        const token = localStorage.getItem('token');
        
        // If there is no token (user is not logged in), redirect to the login page
        if (!token) {
            navigate('/login');
            return;
        }

        // 2. Function to fetch posts from the server securely
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/posts', {
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    }
                });
                setPosts(response.data);
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            }
        };

        fetchPosts();
    }, [navigate]);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Main Feed</h2>
            
            {posts.length === 0 ? (
                <p>No posts yet. Be the first to post!</p>
            ) : (
                posts.map(post => (
                    <div key={post._id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '5px' }}>
                        <p>{post.content}</p>
                        <small style={{ color: 'gray' }}>Author ID: {post.author}</small>
                    </div>
                ))
            )}
        </div>
    );
}