import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PostItem({ post, currentUserId, isAdmin, onPostUpdate, onPostDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [attachmentSrc, setAttachmentSrc] = useState(null);

    const API_URL = 'https://social-network-backend-android2-project.onrender.com/api/posts';
    const BASE_URL = 'https://social-network-backend-android2-project.onrender.com';

    useEffect(() => {
        if (post.attachmentUrl) {
            if (post.attachmentUrl.startsWith('http')) {
                setAttachmentSrc(post.attachmentUrl);
            } else {
                const fetchMedia = async () => {
                    try {
                        const token = localStorage.getItem('token');
                        const response = await axios.get(`${BASE_URL}${post.attachmentUrl}`, {
                            responseType: 'blob',
                            headers: token ? { Authorization: `Bearer ${token}` } : {}
                        });
                        const objectUrl = URL.createObjectURL(response.data);
                        setAttachmentSrc(objectUrl);
                    } catch (error) {
                        console.error('Error fetching media:', error);
                    }
                };
                fetchMedia();
            }
        }
    }, [post.attachmentUrl]);

    const formatTimestamp = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${hours}:${minutes} ${day}.${month}.${year}`;
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/${post._id}`, { content: editContent }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onPostUpdate(res.data);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update post", err);
            alert("Failed to update post");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/${post._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onPostDelete(post._id);
        } catch (err) {
            console.error("Failed to delete post", err);
            alert("Failed to delete post");
        }
    };

    const authorName = post.author?.username || 'Unknown User';
    const authorId = post.author?._id || post.author;
    const isAuthor = authorId === currentUserId;
    const canDelete = isAdmin || isAuthor;
    const canEdit = isAuthor;

    const groupName = post.group?.name;
    const isPublic = !post.group || post.group === "000000000000000000000000" || post.group._id === "000000000000000000000000";

    return (
        <div style={styles.card}>
            {isEditing ? (
                <div>
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{ width: '100%', minHeight: '60px', padding: '5px' }}
                    />
                    <div style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>
                        <button onClick={handleSave} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setIsEditing(false)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </div>
            ) : (
                <>
                    <p style={styles.content}>{post.content}</p>
                    {post.attachmentUrl && post.attachmentType === 'image' && attachmentSrc && (
                        <div style={styles.attachmentContainer}>
                            {/* Removed the hardcoded Render URL */}
                            <img src={attachmentSrc} alt="Post attachment" style={styles.attachment} />
                        </div>
                    )}
                    {post.attachmentUrl && post.attachmentType === 'video' && attachmentSrc && (
                        <div style={styles.attachmentContainer}>
                            {/* Removed the hardcoded Render URL */}
                            <video src={attachmentSrc} controls style={styles.attachment}></video>
                        </div>
                    )}
                </>
            )}

            <div style={styles.footer}>
                <small style={styles.author}>
                    Posted by: {authorName} {!isPublic && groupName ? ` in ${groupName}` : ''}
                </small>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {(canEdit || canDelete) && !isEditing && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                            {canEdit && <button onClick={() => setIsEditing(true)} style={styles.actionBtn}>Edit</button>}
                            {canDelete && <button onClick={handleDelete} style={{ ...styles.actionBtn, color: '#dc3545' }}>Delete</button>}
                        </div>
                    )}
                    {post.createdAt && (
                        <small style={styles.timestamp}>{formatTimestamp(post.createdAt)}</small>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    card: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '15px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    content: {
        fontSize: '16px',
        margin: '0 0 15px 0',
        whiteSpace: 'pre-wrap'
    },
    footer: {
        borderTop: '1px solid #eee',
        paddingTop: '10px',
        color: '#777',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    author: {
        fontWeight: 'bold'
    },
    timestamp: {
        fontSize: '11px',
        color: '#999'
    },
    actionBtn: {
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '2px 8px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    attachmentContainer: {
        marginTop: '10px',
        marginBottom: '15px',
        maxWidth: '100%',
        maxHeight: '400px',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#f1f1f1',
        borderRadius: '8px'
    },
    attachment: {
        maxWidth: '100%',
        maxHeight: '400px',
        objectFit: 'contain'
    }
};