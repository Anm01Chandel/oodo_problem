import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// SwapRequestForm component remains the same
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

    // The useEffect hook for fetching data remains the same
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!token) {
                if (id) {
                    try { const res = await axios.get(`http://localhost:5000/api/users/${id}`); setProfile(res.data); } catch (err) { console.error('Error fetching profile:', err); }
                } else { navigate('/login'); }
                return;
            }
            try {
                const userRes = await axios.get('http://localhost:5000/api/auth', createAuthHeaders());
                setLoggedInUser(userRes.data);
                const profileUrl = id ? `http://localhost:5000/api/users/${id}` : 'http://localhost:5000/api/auth';
                const profileRes = await axios.get(profileUrl, createAuthHeaders());
                setProfile(profileRes.data);
            } catch (err) { console.error("Error fetching data", err); localStorage.removeItem('token'); navigate('/login'); }
        };
        fetchInitialData();
    }, [id, token, navigate]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('http://localhost:5000/api/users/me', profile, createAuthHeaders());
            setProfile(res.data);
            setIsEditMode(false); // Exit edit mode on successful save
        } catch (err) { console.error('Error updating profile:', err); }
    };

    const handleSwapSubmit = async (swapData) => { /* This function is unchanged */ };
    
    // These handlers now correctly link to the full edit form
    const handleInputChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
    const handleSkillsChange = (e, type) => {
        const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(s => s !== "");
        setProfile({ ...profile, [type]: skillsArray });
    };

    if (!profile) {
        return <div>Loading profile...</div>;
    }

    const isOwnProfile = loggedInUser && loggedInUser._id === profile._id;

    return (
        <div>
            {isRequestingSwap && <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99 }} onClick={() => setIsRequestingSwap(false)}></div>}
            {isRequestingSwap && loggedInUser && <SwapRequestForm loggedInUser={loggedInUser} profileUser={profile} onCancel={() => setIsRequestingSwap(false)} onSubmit={handleSwapSubmit} />}

            <h2>User Profile</h2>
            {isEditMode && isOwnProfile ? (
                //  ======= THIS IS THE FULL, WORKING EDIT FORM =======
                <form onSubmit={handleSave} style={{ maxWidth: '500px', margin: 'auto', textAlign: 'left' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Name:</label>
                        <input type="text" name="name" value={profile.name} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Location:</label>
                        <input type="text" name="location" value={profile.location} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Availability:</label>
                        <input type="text" name="availability" value={profile.availability} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Skills Offered (comma-separated):</label>
                        <input type="text" name="skillsOffered" defaultValue={profile.skillsOffered.join(', ')} onChange={(e) => handleSkillsChange(e, 'skillsOffered')} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Skills Wanted (comma-separated):</label>
                        <input type="text" name="skillsWanted" defaultValue={profile.skillsWanted.join(', ')} onChange={(e) => handleSkillsChange(e, 'skillsWanted')} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Profile Privacy:</label>
                        <select name="isPublic" value={profile.isPublic} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }}>
                            <option value={true}>Public</option>
                            <option value={false}>Private</option>
                        </select>
                    </div>
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={() => setIsEditMode(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                </form>
            ) : (
                // ======= THIS IS THE VIEW MODE (UNCHANGED) =======
                <div>
                    <p><strong>Name:</strong> {profile.name}</p>
                    <p><strong>Location:</strong> {profile.location || 'Not specified'}</p>
                    <p><strong>Skills Offered:</strong> {profile.skillsOffered.length > 0 ? profile.skillsOffered.join(', ') : 'None specified'}</p>
                    <p><strong>Skills Wanted:</strong> {profile.skillsWanted.length > 0 ? profile.skillsWanted.join(', ') : 'None specified'}</p>

                    {isOwnProfile && <button onClick={() => setIsEditMode(true)}>Edit Profile</button>}
                    {!isOwnProfile && loggedInUser && <button onClick={() => setIsRequestingSwap(true)}>Request Swap</button>}
                </div>
            )}
        </div>
    );
};

export default Profile;