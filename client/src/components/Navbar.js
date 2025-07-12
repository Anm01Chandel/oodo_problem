import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };
  
  // Define a style for the links
  const linkStyle = { color: 'white', textDecoration: 'none' };

  const authLinks = (
    <>
      <li><Link to="/" style={linkStyle}>Browse Skills</Link></li>
      <li><Link to="/swaps" style={linkStyle}>Swap Requests</Link></li>
      <li><Link to="/profile" style={linkStyle}>My Profile</Link></li>
      <li><a href="#!" onClick={handleLogout} style={{...linkStyle, cursor: 'pointer'}}>Logout</a></li>
    </>
  );

  const guestLinks = (
    <>
      <li><Link to="/register" style={linkStyle}>Register</Link></li>
      <li><Link to="/login" style={linkStyle}>Login</Link></li>
    </>
  );

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: '#333',
    color: 'white',
    flexWrap: 'wrap'
  };

  const ulStyle = {
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    padding: 0
  };

  const liStyle = {
    margin: '0 1rem'
  };

  return (
    <nav style={navStyle}>
      <h1><Link to="/" style={linkStyle}>Skill Swap</Link></h1>
      <ul style={ulStyle}>
        {token ? React.Children.map(authLinks.props.children, child => <li style={liStyle}>{child}</li>) 
               : React.Children.map(guestLinks.props.children, child => <li style={liStyle}>{child}</li>)}
      </ul>
    </nav>
  );
};

export default Navbar;