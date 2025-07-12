import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`);
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBanToggle = async (id) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/users/${id}/ban`);
            fetchUsers(); // Refresh list
        } catch (err) {
            alert('Failed to update ban status.');
        }
    };

    if (loading) return <p>Loading users...</p>;

    return (
        <div className="admin-container">
            <h1>User Management</h1>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.isBanned ? <span className="status-banned">Banned</span> : <span className="status-active">Active</span>}</td>
                            <td>
                                {user.role !== 'admin' && (
                                    <button 
                                        onClick={() => handleBanToggle(user._id)}
                                        className={`btn ${user.isBanned ? 'btn-success' : 'btn-danger'}`}
                                    >
                                        {user.isBanned ? 'Unban' : 'Ban'}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;