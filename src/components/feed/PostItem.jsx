import React from 'react';

export default function PostItem({ post }) {

    const authorName = post.author?.username || 'Unknown User';
    return (
        <div style={styles.card}>
            {/* תוכן הפוסט */}
            <p style={styles.content}>{post.content}</p>
            
            {/* פרטי הכותב */}
            <div style={styles.footer}>
                <small style={styles.author}>Posted by: {authorName}</small>
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
        color: '#777'
    },
    author: {
        fontWeight: 'bold'
    }
};