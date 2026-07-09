import React, { useState, useRef } from 'react';

export default function CreatePost({ onPublish }) {
    const [postContent, setPostContent] = useState('');

    const [attachment, setAttachment] = useState(null);

    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        // מונע שליחת פוסט ריק אם אין גם טקסט וגם אין קובץ
        if (!postContent.trim() && !attachment) return;

        // מפעיל את הפונקציה שנקבל מההורה (MainFeed)
        onPublish(postContent, attachment);

        // מנקה את התיבות אחרי הפרסום
        setPostContent('');
        setAttachment(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

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

                <div style={styles.actionRow}>
                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => setAttachment(e.target.files[0])}
                        style={{ fontSize: '14px' }}
                    />
                    <button type="submit" style={styles.button}>
                        Publish Post
                    </button>
                </div>
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
    actionRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
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