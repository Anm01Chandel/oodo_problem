import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/admin/stats', {
                    headers: { 'x-auth-token': token }
                });
                setStats(res.data);
            } catch (err) {
                setError('Failed to fetch admin statistics. You may not have permission.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cardStyle = {
        padding: '2rem',
        margin: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
        minWidth: '200px'
    };
    
    const linkContainerStyle = { marginTop: '2rem', fontSize: '1.2rem', padding: '2rem', borderTop: '1px solid #eee' };

    if (loading) return <div>Loading Admin Dashboard...</div>;
    if (error) return <div style={{color: 'red'}}>{error}</div>;

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Admin Dashboard</h2>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                {stats && (
                    <>
                        <div style={cardStyle}>
                            <h3>Total Users</h3>
                            <p style={{fontSize: '2rem', fontWeight: 'bold'}}>{stats.users}</p>
                        </div>
                        <div style={cardStyle}>
                            <h3>Total Swaps</h3>
                            <p style={{fontSize: '2rem', fontWeight: 'bold'}}>{stats.totalSwaps}</p>
                        </div>
                        <div style={cardStyle}>
                            <h3>Pending Swaps</h3>
                            <p style={{fontSize: '2rem', fontWeight: 'bold'}}>{stats.pendingSwaps}</p>
                        </div>
                    </>
                )}
            </div>
            
            <div style={linkContainerStyle}>
                <h3>Management Tools</h3>
                <Link to="/admin/users" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Manage Users</Link>
            </div>
        </div>
    );
};

export default AdminDashboard;