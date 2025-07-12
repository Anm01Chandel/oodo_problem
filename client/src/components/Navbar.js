import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const onLogout = () => {
        logout();
        navigate('/');
    };

    const authLinks = (
        <ul>
            {user?.role === 'admin' && (
                <li><Link to="/admin">Admin</Link></li>
            )}
            <li><Link to="/">Browse</Link></li>
            <li><Link to="/requests">Swap Requests</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><a onClick={onLogout} href="#!">Logout</a></li>
        </ul>
    );

    const guestLinks = (
        <ul>
            <li><Link to="/">Browse</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
        </ul>
    );

    return (
        <nav className="navbar">
            <h1>
                <Link to="/">SkillSwap</Link>
            </h1>
            {isAuthenticated ? authLinks : guestLinks}
        </nav>
    );
};

export default Navbar;
