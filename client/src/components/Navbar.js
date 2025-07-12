import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const res = await axios.get('http://localhost:5000/api/auth', {
                        headers: { 'x-auth-token': token }
                    });
                    setUser(res.data);
                } catch (err) {
                    // Handle invalid token
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
        };
        fetchUser();
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const linkStyle = { color: 'white', textDecoration: 'none' };
    const liStyle = { margin: '0 1rem' };
    const ulStyle = { display: 'flex', listStyle: 'none', margin: 0, padding: 0 };
    const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#333', color: 'white' };

    const authLinks = (
        <>
            {user && user.role === 'admin' && (
                <li style={liStyle}><Link to="/admin" style={linkStyle}>Admin</Link></li>
            )}
            <li style={liStyle}><Link to="/" style={linkStyle}>Browse</Link></li>
            <li style={liStyle}><Link to="/swaps" style={linkStyle}>Swaps</Link></li>
            <li style={liStyle}><Link to="/profile" style={linkStyle}>Profile</Link></li>
            <li style={liStyle}><a href="#!" onClick={handleLogout} style={{ ...linkStyle, cursor: 'pointer' }}>Logout</a></li>
        </>
    );

    const guestLinks = (
        <>
            <li style={liStyle}><Link to="/register" style={linkStyle}>Register</Link></li>
            <li style={liStyle}><Link to="/login" style={linkStyle}>Login</Link></li>
        </>
    );

    return (
        <nav style={navStyle}>
            <h1><Link to="/" style={linkStyle}>Skill Swap</Link></h1>
            <ul style={ulStyle}>
                {token ? authLinks : guestLinks}
            </ul>
        </nav>
    );
};

export default Navbar;