import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// A simple modal component for the swap request form
const SwapRequestForm = ({ loggedInUser, profileUser, onCancel, onSubmit }) => {
    const [offerSkill, setOfferSkill] = useState(loggedInUser.skillsOffered[0] || '');
    const [wantSkill, setWantSkill] = useState(profileUser.skillsOffered[0] || '');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            requesteeId: profileUser._id,
            skillOffered: offerSkill,
            skillWanted: wantSkill,
            message,
        });
    };

    return (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', zIndex: 100, width: '400px' }}>
            <h3>Request a Swap with {profileUser.name}</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Your Skill to Offer:</label>
                    <select value={offerSkill} onChange={(e) => setOfferSkill(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
                        {loggedInUser.skillsOffered.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                    </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Skill you Want:</label>
                    <select value={wantSkill} onChange={(e) => setWantSkill(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
                        {profileUser.skillsOffered.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                    </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Message:</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hi! I'd like to swap skills." style={{ width: '100%', minHeight: '80px', padding: '8px', marginTop: '4px' }}></textarea>
                </div>
                <button type="submit">Send Request</button>
                <button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
            </form>
        </div>
    );
};


const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isRequestingSwap, setIsRequestingSwap] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const createAuthHeaders = () => ({ headers: { 'x-auth-token': token } });

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!token) {
                // If no token and trying to view a specific profile, just fetch that profile
                if (id) {
                    try {
                        const res = await axios.get(`http://localhost:5000/api/users/${id}`);
                        setProfile(res.data);
                    } catch (err) {
                        console.error('Error fetching profile:', err);
                    }
                } else {
                    // No token and no profile ID, go to login
                    navigate('/login');
                }
                return;
            }

            // If we have a token, fetch the logged-in user first
            try {
                const userRes = await axios.get('http://localhost:5000/api/auth', createAuthHeaders());
                setLoggedInUser(userRes.data);

                // Now determine which profile to fetch
                const profileUrl = id ? `http://localhost:5000/api/users/${id}` : 'http://localhost:5000/api/auth';
                const profileRes = await axios.get(profileUrl, createAuthHeaders());
                setProfile(profileRes.data);

            } catch (err) {
                console.error("Error fetching data", err);
                // Maybe the token is invalid, log them out
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        fetchInitialData();
    }, [id, token, navigate]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('http://localhost:5000/api/users/me', profile, createAuthHeaders());
            setProfile(res.data);
            setIsEditMode(false);
        } catch (err) { console.error('Error updating profile:', err); }
    };

    const handleSwapSubmit = async (swapData) => {
        try {
            await axios.post('http://localhost:5000/api/swaps', swapData, createAuthHeaders());
            alert('Swap request sent!');
            setIsRequestingSwap(false);
            navigate('/swaps');
        } catch (err) {
            console.error('Error sending swap request:', err.response.data);
            alert(`Error: ${err.response.data.msg}`);
        }
    };
    
    const handleInputChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
    const handleSkillsChange = (e, type) => setProfile({ ...profile, [type]: e.target.value.split(',').map(s => s.trim()) });

    // THIS IS THE CRITICAL FIX: Check for loading state FIRST.
    if (!profile) {
        return <div>Loading profile...</div>;
    }

    // Now it's safe to check properties, but we still need to handle the case where we are viewing another profile while not logged in.
    const isOwnProfile = loggedInUser && loggedInUser._id === profile._id;

    return (
        <div>
            {isRequestingSwap && <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99 }} onClick={() => setIsRequestingSwap(false)}></div>}
            {isRequestingSwap && loggedInUser && <SwapRequestForm loggedInUser={loggedInUser} profileUser={profile} onCancel={() => setIsRequestingSwap(false)} onSubmit={handleSwapSubmit} />}

            <h2>User Profile</h2>
            {isEditMode && isOwnProfile ? (
                 <form onSubmit={handleSave}>{/* Edit form will work here now */}</form>
            ) : (
                <div>
                    <p><strong>Name:</strong> {profile.name}</p>
                    <p><strong>Location:</strong> {profile.location || 'Not specified'}</p>
                    <p><strong>Skills Offered:</strong> {profile.skillsOffered.join(', ')}</p>
                    <p><strong>Skills Wanted:</strong> {profile.skillsWanted.join(', ')}</p>

                    {isOwnProfile && <button onClick={() => setIsEditMode(true)}>Edit Profile</button>}
                    {!isOwnProfile && loggedInUser && <button onClick={() => setIsRequestingSwap(true)}>Request Swap</button>}
                </div>
            )}
        </div>
    );
};

export default Profile;