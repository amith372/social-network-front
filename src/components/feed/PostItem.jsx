import React from 'react';

export default function PostItem({ post }) {

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

    const authorName = post.author?.username || 'Unknown User';
    return (
        <div style={styles.card}>
            {/* תוכן הפוסט */}
            <p style={styles.content}>{post.content}</p>

            {/* פרטי הכותב */}
            <div style={styles.footer}>
                <small style={styles.author}>Posted by: {authorName}</small>
                {post.createdAt && (
                    <small style={styles.timestamp}>{formatTimestamp(post.createdAt)}</small>
                )}
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
        margin: '0 0 15px 0'
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
    }
};