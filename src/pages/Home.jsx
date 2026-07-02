import React, { useState } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import MainFeed from '../components/feed/MainFeed';
import GroupsSidebar from '../components/groups/GroupsSidebar';
import StatisticsCharts from '../components/graphs/StatisticsCharts';

const PUBLIC_GROUP = {
    _id: "000000000000000000000000",
    name: "Public Feed"
};

export default function Home() {
    const [selectedGroup, setSelectedGroup] = useState(PUBLIC_GROUP); // Default to public feed

    return (

        <div style={styles.container}>

            {/* private chats column */}
            <div style={styles.leftColumn}>
                <ChatSidebar selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} />
            </div>

            {/* feed column*/}
            <div style={styles.centerColumn}>
                <MainFeed selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} />
                <StatisticsCharts />
            </div>

            {/* groups column */}
            <div style={styles.rightColumn}>
                <GroupsSidebar selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} />
            </div>

        </div>
    );
}


const styles = {
    container: {
        display: 'grid',
        // split the screen into 3 columns: left (1fr), center (2fr), right (1fr)
        gridTemplateColumns: '1fr 2fr 1fr',
        gap: '20px',
        padding: '20px',
        maxWidth: '1400px',
        margin: '0 auto',
        height: 'calc(100vh - 80px)'
    },
    leftColumn: {
        border: '2px solid black',
        borderRadius: '8px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 120px)'
    },
    centerColumn: {

        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    rightColumn: {
        border: '2px solid black',
        borderRadius: '8px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 120px)'
    }
};