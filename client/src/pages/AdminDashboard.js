import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Hook for navigation

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            
            // --- START: ADD THIS GUARD CLAUSE ---
            // If there's no token, don't even try to fetch.
            // This can happen in rare race conditions or if the user manually clears storage.
            if (!token) {
                setError('No authorization token found. Please log in.');
                setLoading(false);
                // Optional: redirect to login after a delay
                setTimeout(() => navigate('/login'), 2000);
                return; // Stop the function here
            }
            // --- END: ADD THIS GUARD CLAUSE ---

            try {
                const res = await axios.get('http://localhost:5000/api/admin/stats', {
                    headers: { 'x-auth-token': token }
                });
                setStats(res.data);
            } catch (err) {
                setError('Failed to fetch admin statistics. You may not have permission.');
                console.error(err);
            } finally {
                // This will now always be reached
                setLoading(false);
            }
        };

        fetchStats();
    }, [navigate]); // Add navigate to the dependency array

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
    const linkStyle = { textDecoration: 'none', color: '#007bff', fontWeight: 'bold', margin: '0 1rem' };

    if (loading) return <div>Loading Admin Dashboard...</div>;
    if (error) return <div style={{color: 'red', padding: '2rem'}}>{error}</div>;

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
                <Link to="/admin/users" style={linkStyle}>Manage Users</Link>
                <Link to="/admin/swaps" style={linkStyle}>Manage Swaps</Link>
            </div>
        </div>
    );
};

export default AdminDashboard;