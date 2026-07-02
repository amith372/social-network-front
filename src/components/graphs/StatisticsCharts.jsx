import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import * as d3 from 'd3';

export default function StatisticsCharts() {
    const [groupsData, setGroupsData] = useState([]);
    const [langsData, setLangsData] = useState([]);

    const barChartRef = useRef();
    const pieChartRef = useRef();

    const USERS_API_URL = 'https://social-network-backend-android2-project.onrender.com/api/users';
    const GROUPS_API_URL = 'https://social-network-backend-android2-project.onrender.com/api/groups';

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch users, groups, and languages
            const [usersRes, groupsRes, langsRes] = await Promise.all([
                axios.get(`${USERS_API_URL}?includeSelf=true`, { headers }),
                axios.get(GROUPS_API_URL, { headers }),
                axios.get('https://libretranslate.com/languages').catch(() => ({ data: [] }))
            ]);

            const users = usersRes.data;
            const groups = groupsRes.data;
            const fetchedLangs = langsRes.data || [];

            const langMap = {};
            fetchedLangs.forEach(lang => {
                langMap[lang.code] = lang.name;
            });

            // Process Groups data for top 5 (only group chats, not private DMs)
            const groupChats = groups.filter(g => g.isGroupChat);
            const sortedGroups = groupChats
                .sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
                .slice(0, 5)
                .map(g => ({
                    name: g.name,
                    members: g.members?.length || 0
                }));

            setGroupsData(sortedGroups);

            // Process Languages data for top 5
            const langCounts = {};
            users.forEach(u => {
                if (u.language && Array.isArray(u.language)) {
                    u.language.forEach(lang => {
                        const l = lang.trim();
                        if (l) {
                            langCounts[l] = (langCounts[l] || 0) + 1;
                        }
                    });
                }
            });

            const sortedLangs = Object.entries(langCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([code, value]) => ({ name: langMap[code] || code, value }));

            setLangsData(sortedLangs);

        } catch (error) {
            console.error("Error fetching statistics:", error);
        }
    };

    useEffect(() => {
        fetchData();

        const socket = io('https://social-network-backend-android2-project.onrender.com');

        // Listen for new users or groups to update stats
        socket.on('new_user', () => fetchData());
        socket.on('update_user', () => fetchData());
        socket.on('new_group', () => fetchData());
        socket.on('update_group', () => fetchData());

        return () => socket.disconnect();
    }, []);

    // Draw Bar Chart with D3
    useEffect(() => {
        if (!groupsData.length) return;

        const width = 600;
        const height = 250;
        const margin = { top: 30, right: 20, bottom: 80, left: 20 };

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(barChartRef.current);
        svg.selectAll("*").remove();

        svg.attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%")
            .style("height", "100%");

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(groupsData.map(d => d.name))
            .range([0, innerWidth])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(groupsData, d => d.members) || 1])
            .nice()
            .range([innerHeight, 0]);

        // X Axis (bottom line and rotated labels)
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).tickFormat(d => d.length > 15 ? d.substring(0, 15) + '...' : d))
            .selectAll("text")
            .attr("transform", "translate(-10,5)rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .style("fill", "#666");

        // We completely omit the Y Axis as requested

        // Bars
        g.selectAll(".bar")
            .data(groupsData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.name))
            .attr("y", d => y(d.members))
            .attr("width", x.bandwidth())
            .attr("height", d => innerHeight - y(d.members))
            .attr("fill", "#82ca9d")
            .attr("rx", 4) // Rounded corners
            .attr("ry", 4)
            .on("mouseover", (event, d) => {
                let tip = d3.select("#d3-tooltip");
                if (tip.empty()) {
                    tip = d3.select("body").append("div")
                        .attr("id", "d3-tooltip")
                        .style("position", "absolute")
                        .style("background-color", "rgba(0,0,0,0.8)")
                        .style("color", "white")
                        .style("padding", "6px 12px")
                        .style("border-radius", "4px")
                        .style("pointer-events", "none")
                        .style("font-size", "12px")
                        .style("opacity", 0)
                        .style("z-index", 1000);
                }
                tip.transition().duration(200).style("opacity", 1);
                tip.html(`<strong>${d.name}</strong><br/>Members: ${d.members}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                d3.select(event.currentTarget).style("opacity", 0.7);
            })
            .on("mouseout", (event) => {
                d3.select("#d3-tooltip").transition().duration(500).style("opacity", 0);
                d3.select(event.currentTarget).style("opacity", 1);
            });

        // Labels on top of bars
        g.selectAll(".label")
            .data(groupsData)
            .enter().append("text")
            .attr("class", "label")
            .attr("x", d => x(d.name) + x.bandwidth() / 2)
            .attr("y", d => y(d.members) - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#666")
            .text(d => d.members);

    }, [groupsData]);

    // Draw Pie Chart with D3
    useEffect(() => {
        if (!langsData.length) return;

        const width = 600;
        const height = 250;
        const radius = 100; // Enlarged pie chart radius

        const svg = d3.select(pieChartRef.current);
        svg.selectAll("*").remove();

        svg.attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%")
            .style("height", "100%");

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
        const color = d3.scaleOrdinal()
            .domain(langsData.map(d => d.name))
            .range(COLORS);

        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        const outerArc = d3.arc()
            .innerRadius(radius + 15)
            .outerRadius(radius + 15);

        const arcs = g.selectAll(".arc")
            .data(pie(langsData))
            .enter().append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.name))
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .on("mouseover", (event, d) => {
                let tip = d3.select("#d3-tooltip");
                if (tip.empty()) {
                    tip = d3.select("body").append("div")
                        .attr("id", "d3-tooltip")
                        .style("position", "absolute")
                        .style("background-color", "rgba(0,0,0,0.8)")
                        .style("color", "white")
                        .style("padding", "6px 12px")
                        .style("border-radius", "4px")
                        .style("pointer-events", "none")
                        .style("font-size", "12px")
                        .style("opacity", 0)
                        .style("z-index", 1000);
                }
                tip.transition().duration(200).style("opacity", 1);
                tip.html(`<strong>${d.data.name}</strong><br/>Users: ${d.data.value}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                d3.select(event.currentTarget).style("opacity", 0.7);
            })
            .on("mouseout", (event) => {
                d3.select("#d3-tooltip").transition().duration(500).style("opacity", 0);
                d3.select(event.currentTarget).style("opacity", 1);
            });

        // External labels for pie slices
        arcs.append("text")
            .attr("transform", d => {
                const pos = outerArc.centroid(d);
                return `translate(${pos})`;
            })
            .attr("dy", ".35em")
            .style("text-anchor", d => {
                const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return (midAngle < Math.PI) ? "start" : "end";
            })
            .style("font-size", "12px")
            .style("fill", "#333")
            .text(d => {
                const name = d.data.name.length > 15 ? d.data.name.substring(0, 15) + '...' : d.data.name;
                return `${name} (${d.data.value})`;
            });

    }, [langsData]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            <div style={{ height: '300px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h4 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>Top 5 Groups by Members</h4>
                <div style={{ width: '100%', height: '85%' }}>
                    <svg ref={barChartRef}></svg>
                </div>
            </div>
            <div style={{ height: '300px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h4 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>Top 5 Languages</h4>
                <div style={{ width: '100%', height: '85%' }}>
                    <svg ref={pieChartRef}></svg>
                </div>
            </div>
        </div>
    );
}
