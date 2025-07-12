import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users?skill=${searchTerm}`);
                setUsers(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchUsers();
    }, [searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        // The useEffect hook will re-fetch data when searchTerm changes
    };

    return (
        <div>
            <h1 className="home-title">Find a Skill Swap Partner</h1>
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search by skill (e.g., Photoshop, Guitar)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">Search</button>
            </form>

            <div className="user-grid">
                {loading ? (
                    <p>Loading users...</p>
                ) : users.length > 0 ? (
                    users.map(user => (
                        <div key={user._id} className="user-card">
                            <img src={user.avatar} alt={`${user.name}'s avatar`} className="user-avatar" />
                            <h3>{user.name}</h3>
                            <p className="location">{user.location || 'Location not specified'}</p>
                            <div className="skills-section">
                                <h4>Offers:</h4>
                                <div className="skills-list">
                                    {user.skillsOffered.slice(0, 3).map((skill, index) => (
                                        <span key={index} className="skill-tag">{skill}</span>
                                    ))}
                                    {user.skillsOffered.length > 3 && '...'}
                                </div>
                            </div>
                            <div className="skills-section">
                                <h4>Wants:</h4>
                                <div className="skills-list">
                                    {user.skillsWanted.slice(0, 3).map((skill, index) => (
                                        <span key={index} className="skill-tag-wanted">{skill}</span>
                                    ))}
                                    {user.skillsWanted.length > 3 && '...'}
                                </div>
                            </div>
                            <Link to={`/profile/${user._id}`} className="btn btn-light">View Profile</Link>
                        </div>
                    ))
                ) : (
                    <p>No users found. Try a different search.</p>
                )}
            </div>
        </div>
    );
};

export default Home;