import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async (skill = '') => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users?skill=${skill}`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch all users on component mount
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(searchTerm);
  };

  const userCardStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px',
    textAlign: 'left',
    maxWidth: '500px'
  };

  const skillsContainerStyle = {
    marginTop: '8px'
  }

  const skillTagStyle = {
    display: 'inline-block',
    backgroundColor: '#e0e0e0',
    padding: '4px 8px',
    borderRadius: '4px',
    margin: '4px'
  }

  return (
    <div>
      <h2>Browse Skill Profiles</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by skill (e.g., Photoshop)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', width: '300px' }}
        />
        <button type="submit" style={{ padding: '8px' }}>Search</button>
      </form>

      <div>
        {users.map((user) => (
          <div key={user._id} style={userCardStyle}>
            <h3>{user.name}</h3>
            <p>{user.location}</p>
            <div style={skillsContainerStyle}>
              <strong>Skills Offered:</strong>
              {user.skillsOffered.map((skill, index) => (
                <span key={index} style={skillTagStyle}>{skill}</span>
              ))}
            </div>
             <div style={skillsContainerStyle}>
              <strong>Skills Wanted:</strong>
              {user.skillsWanted.map((skill, index) => (
                <span key={index} style={skillTagStyle}>{skill}</span>
              ))}
            </div>
            <Link to={`/profile/${user._id}`}>
              <button style={{ marginTop: '10px' }}>View Profile</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;