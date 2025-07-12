import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/users', {
                headers: { 'x-auth-token': token }
            });
            setUsers(res.data);
        } catch (err) {
            setError('Failed to fetch users.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBanToggle = async (userId) => {
        if (window.confirm('Are you sure you want to change the ban status for this user?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`http://localhost:5000/api/admin/users/${userId}/ban`, {}, {
                    headers: { 'x-auth-token': token }
                });
                // To show the change immediately, we can update the state directly
                // instead of re-fetching the whole list.
                setUsers(users.map(user => 
                    user._id === userId ? { ...user, isBanned: !user.isBanned } : user
                ));
            } catch (err) {
                alert(`Error: ${err.response.data.msg || 'Action failed.'}`);
            }
        }
    };

    if (loading) return <div>Loading users...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <Link to="/admin">← Back to Admin Dashboard</Link>
            <h2 style={{marginTop: '1rem'}}>User Management</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #333', backgroundColor: '#f2f2f2' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '12px' }}>{user.name}</td>
                            <td style={{ padding: '12px' }}>{user.email}</td>
                            <td style={{ padding: '12px' }}>{user.role}</td>
                            <td style={{ padding: '12px' }}>
                                {user.isBanned ? 
                                    <span style={{ color: 'white', backgroundColor: 'red', padding: '4px 8px', borderRadius: '4px' }}>Banned</span> : 
                                    <span style={{ color: 'white', backgroundColor: 'green', padding: '4px 8px', borderRadius: '4px' }}>Active</span>
                                }
                            </td>
                            <td style={{ padding: '12px' }}>
                                <Link to={`/profile/${user._id}`}><button>View Profile</button></Link>
                                <button 
                                    onClick={() => handleBanToggle(user._id)} 
                                    style={{ marginLeft: '10px', backgroundColor: user.isBanned ? '#90EE90' : '#F08080', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    {user.isBanned ? 'Unban' : 'Ban'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;