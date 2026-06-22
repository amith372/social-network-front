import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const navigate = useNavigate();

    // Base URL of your newly deployed Render server
    const API_URL = 'https://social-network-server-mfxh.onrender.com/api/posts';

    useEffect(() => {
        // Retrieve the token from the browser's local storage
        const token = localStorage.getItem('token');
        
        // If there is no token (user is not logged in), redirect to the login page
        if (!token) {
            navigate('/login');
            return;
        }

        // 2. Function to fetch all posts from the live server securely
        const fetchPosts = async () => {
            try {
                const response = await axios.get(API_URL, {
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    }
                });
                
                if (Array.isArray(response.data)) {
                    setPosts(response.data);
                } else {
                    setPosts([]);
                }
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            }
        };

        fetchPosts();
    }, [navigate]);

    // 3. Function to handle creating a new public post
    const handleCreatePost = async (e) => {
        e.preventDefault();
        
        if (!newPostContent.trim()) return;

        const token = localStorage.getItem('token');
        
        try {
            const response = await axios.post(API_URL, {
                content: newPostContent,
                // default group ID for public posts;
                group: "000000000000000000000000" 
            }, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            });

            // Prepend the newly created post to the top of the feed and clear input
            setPosts([response.data, ...posts]);
            setNewPostContent('');
            
        } catch (error) {
            console.error("Failed to create post:", error);
            alert("Error creating post. Make sure the Group ID exists in your database.");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Main Feed (Public)</h2>
            
            {/* Create Post Form */}
            <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <form onSubmit={handleCreatePost}>
                    <textarea 
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Share something with everyone..."
                        style={{ width: '100%', height: '80px', marginBottom: '10px', padding: '10px', boxSizing: 'border-box' }}
                        required
                    />
                    <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Publish Post
                    </button>
                </form>
            </div>

            {/* Render Posts List */}
            {posts.length === 0 ? (
                <p>No public posts yet. Be the first to post!</p>
            ) : (
                posts.map(post => (
                    <div key={post._id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '5px' }}>
                        <p>{post.content}</p>
                        <small style={{ color: 'gray' }}>Posted by: {post.author.username}</small>
                    </div>
                ))
            )}
        </div>
    );
}