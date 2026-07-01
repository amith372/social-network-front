import React, { useState } from 'react';

export default function CreatePost({ onPublish }) {
    const [postContent, setPostContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // מונע שליחת פוסט ריק
        if (!postContent.trim()) return;

        // מפעיל את הפונקציה שנקבל מההורה (MainFeed)
        onPublish(postContent);

        // מנקה את תיבת הטקסט אחרי הפרסום
        setPostContent('');
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit}>
                <textarea
                    style={styles.textarea}
                    placeholder="Share post..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows="3"
                />
                <button type="submit" style={styles.button}>
                    Publish Post
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '25px',
        backgroundColor: '#fafafa'
    },
    textarea: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        resize: 'none', // מונע מתיחה של התיבה
        marginBottom: '10px',
        boxSizing: 'border-box'
    },
    button: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
    }
};