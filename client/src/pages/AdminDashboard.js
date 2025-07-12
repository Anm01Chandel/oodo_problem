import React from 'react';
import { Link } from 'react-router-dom';
import './Admin.css';

const AdminDashboard = () => {
    // In a real app, you might fetch some stats here (e.g., number of users, pending swaps)
    return (
        <div className="admin-container">
            <h1>Admin Dashboard</h1>
            <p>Welcome, Admin. Use the tools below to manage the platform.</p>

            <div className="admin-grid">
                <Link to="/admin/users" className="admin-card">
                    <h2>User Management</h2>
                    <p>View, ban, or unban users.</p>
                </Link>
                <Link to="/admin/swaps" className="admin-card">
                    <h2>Swap Management</h2>
                    <p>Monitor all swap activities.</p>
                </Link>
                <div className="admin-card">
                     <h2>Reports</h2>
                    <p>Download platform data.</p>
                    <div className="report-buttons">
                        <a href={`${process.env.REACT_APP_API_URL}/api/admin/reports/users?token=${localStorage.getItem('token')}`} className="btn btn-light">Download User CSV</a>
                        <a href={`${process.env.REACT_APP_API_URL}/api/admin/reports/swaps?token=${localStorage.getItem('token')}`} className="btn btn-light">Download Swaps CSV</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
// Note: Passing token in URL is not ideal, but works for this demo without complex auth flows.
// A better way is to have the download link trigger a fetch with auth headers that returns a blob.

export default AdminDashboard;