import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

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
            if (!token && !id) {
                navigate('/login');
                return;
            }

            try {
                if (token) {
                    const userRes = await axios.get('http://localhost:5000/api/auth', createAuthHeaders());
                    setLoggedInUser(userRes.data);
                }

                const profileId = id || (token && (await axios.get('http://localhost:5000/api/auth', createAuthHeaders())).data._id);
                if (profileId) {
                    const profileRes = await axios.get(`http://localhost:5000/api/users/${profileId}`, token ? createAuthHeaders() : {});
                    setProfile(profileRes.data);
                }
            } catch (err) {
                console.error("Error fetching data", err);
                if (err.response && err.response.status === 401) {
                  localStorage.removeItem('token');
                  navigate('/login');
                }
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
            alert('Swap request sent successfully!');
            setIsRequestingSwap(false);
            navigate('/swaps');
        } catch (err) {
            const errorMsg = err.response ? err.response.data.msg : 'An unknown error occurred.';
            console.error('Error sending swap request:', errorMsg);
            alert(`Error: ${errorMsg}`);
        }
    };
    
    const handleInputChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
    const handleSkillsChange = (e, type) => {
        const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(s => s !== "");
        setProfile({ ...profile, [type]: skillsArray });
    };

    if (!profile) {
        return <div>Loading profile...</div>;
    }

    const isOwnProfile = loggedInUser && loggedInUser._id === profile._id;
    const canRequestSwap = loggedInUser && loggedInUser.skillsOffered.length > 0 && profile.skillsOffered.length > 0;

    const averageRating = profile.ratings.length > 0
        ? (profile.ratings.reduce((acc, item) => acc + item.rating, 0) / profile.ratings.length).toFixed(1)
        : 'No ratings yet';

    return (
        <div style={{ padding: '2rem' }}>
            {isRequestingSwap && <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99 }} onClick={() => setIsRequestingSwap(false)}></div>}
            {isRequestingSwap && loggedInUser && <SwapRequestForm loggedInUser={loggedInUser} profileUser={profile} onCancel={() => setIsRequestingSwap(false)} onSubmit={handleSwapSubmit} />}

            {isEditMode && isOwnProfile ? (
                <form onSubmit={handleSave} style={{ maxWidth: '500px', margin: 'auto', textAlign: 'left' }}>
                    <h2>Edit Profile</h2>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Name:</label>
                        <input type="text" name="name" value={profile.name} onChange={handleInputChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Location:</label>
                        <input type="text" name="location" value={profile.location || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Availability:</label>
                        <input type="text" name="availability" value={profile.availability} onChange={handleInputChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Skills Offered (comma-separated):</label>
                        <input type="text" name="skillsOffered" defaultValue={profile.skillsOffered.join(', ')} onChange={(e) => handleSkillsChange(e, 'skillsOffered')} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Skills Wanted (comma-separated):</label>
                        <input type="text" name="skillsWanted" defaultValue={profile.skillsWanted.join(', ')} onChange={(e) => handleSkillsChange(e, 'skillsWanted')} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Profile Privacy:</label>
                        <select name="isPublic" value={profile.isPublic.toString()} onChange={handleInputChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                            <option value="true">Public</option>
                            <option value="false">Private</option>
                        </select>
                    </div>
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={() => setIsEditMode(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                </form>
            ) : (
                <div style={{ maxWidth: '600px', margin: 'auto' }}>
                    <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
                        <h2>
                            {profile.name} - <span title="Average Rating">⭐ {averageRating}</span>
                        </h2>
                        <p><strong>Location:</strong> {profile.location || 'Not specified'}</p>
                        <p><strong>Availability:</strong> {profile.availability || 'Not specified'}</p>
                        <p><strong>Skills Offered:</strong> {profile.skillsOffered.length > 0 ? profile.skillsOffered.join(', ') : 'None specified'}</p>
                        <p><strong>Skills Wanted:</strong> {profile.skillsWanted.length > 0 ? profile.skillsWanted.join(', ') : 'None specified'}</p>
                        <p><strong>Profile Status:</strong> {profile.isPublic ? 'Public' : 'Private'}</p>
                        {isOwnProfile && <button onClick={() => setIsEditMode(true)}>Edit Profile</button>}
                        {!isOwnProfile && loggedInUser && (
                            <button onClick={() => setIsRequestingSwap(true)} disabled={!canRequestSwap} style={{ marginTop: '1rem' }}>
                                Request Swap
                            </button>
                        )}
                        {!isOwnProfile && loggedInUser && !canRequestSwap && (
                            <p style={{color: 'grey', fontSize: '0.9em', marginTop: '1rem' }}>
                                *You or this user must add skills to your profiles to request a swap.
                            </p>
                        )}
                    </div>

                    <div style={{ marginTop: '3rem', textAlign: 'left' }}>
                        <h3>Feedback History</h3>
                        {profile.ratings.length > 0 ? (
                            profile.ratings.map((r) => (
                                <div key={r._id} style={{ border: '1px solid #eee', padding: '1rem', marginBottom: '1rem', borderRadius: '5px' }}>
                                    <p><strong>Rating: {r.rating}/5</strong> - from {r.user ? r.user.name : 'A user'}</p>
                                    {r.feedback && <p>"{r.feedback}"</p>}
                                </div>
                            ))
                        ) : (
                            <p>No feedback has been left for this user yet.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;