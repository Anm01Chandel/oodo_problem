import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import AvatarSelectionModal from '../components/AvatarSelectionModal';

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
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            zIndex: 100,
            width: '400px'
        }}>
            <h3>Request a Swap with {profileUser.name}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label>Skill You Offer:</label>
                <select value={offerSkill} onChange={(e) => setOfferSkill(e.target.value)}>
                    {loggedInUser.skillsOffered.map((skill, i) => (
                        <option key={i} value={skill}>{skill}</option>
                    ))}
                </select>

                <label>Skill You Want:</label>
                <select value={wantSkill} onChange={(e) => setWantSkill(e.target.value)}>
                    {profileUser.skillsOffered.map((skill, i) => (
                        <option key={i} value={skill}>{skill}</option>
                    ))}
                </select>

                <label>Message:</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button type="submit">Send</button>
                    <button type="button" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isRequestingSwap, setIsRequestingSwap] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const serverUrl = 'http://localhost:5000';

    const createAuthHeaders = () => ({ headers: { 'x-auth-token': token } });

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!token && !id) {
                navigate('/login');
                return;
            }
            try {
                let currentUserId = null;
                if (token) {
                    const userRes = await axios.get(`${serverUrl}/api/auth`, createAuthHeaders());
                    setLoggedInUser(userRes.data);
                    currentUserId = userRes.data._id;
                }
                const profileId = id || currentUserId;
                if (profileId) {
                    const profileRes = await axios.get(`${serverUrl}/api/users/${profileId}`, token ? createAuthHeaders() : {});
                    setProfile(profileRes.data);
                }
            } catch (err) {
                console.error("Error fetching data", err);
                if (err.response?.status === 401) {
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
            const res = await axios.put(`${serverUrl}/api/users/me`, profile, createAuthHeaders());
            setProfile(res.data);
            setIsEditMode(false);
        } catch (err) {
            console.error('Failed to save profile:', err);
            alert('Failed to save profile');
        }
    };

    const handleSwapSubmit = async (swapData) => {
        try {
            await axios.post(`${serverUrl}/api/swaps`, swapData, createAuthHeaders());
            alert('Swap request sent!');
            setIsRequestingSwap(false);
        } catch (err) {
            console.error('Failed to send swap request:', err);
            alert('Error sending swap request');
        }
    };

    const handleInputChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

    const handleSkillsChange = (e, type) => {
        const updatedSkills = e.target.value.split(',').map(s => s.trim());
        setProfile(prev => ({ ...prev, [type]: updatedSkills }));
    };

    const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

    const handlePhotoUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append('photo', selectedFile);

        try {
            const res = await axios.post(`${serverUrl}/api/upload`, formData, createAuthHeaders());
            const updatedUser = await axios.put(`${serverUrl}/api/users/me`, { profilePhoto: res.data.url }, createAuthHeaders());
            setProfile(updatedUser.data);
            alert('Photo updated!');
        } catch (err) {
            console.error('Error uploading photo:', err);
            alert('Failed to upload photo');
        }
    };

    const handleAvatarSelect = async (avatarUrl) => {
        try {
            const res = await axios.put(`${serverUrl}/api/users/me`, { profilePhoto: avatarUrl }, createAuthHeaders());
            setProfile(res.data);
            setIsAvatarModalOpen(false);
            alert('Avatar updated!');
        } catch (err) {
            console.error('Error selecting avatar:', err);
            alert('Failed to update avatar.');
        }
    };

    if (!profile) return <div>Loading profile...</div>;

    const isOwnProfile = loggedInUser && loggedInUser._id === profile._id;
    const canRequestSwap = loggedInUser && loggedInUser.skillsOffered.length > 0 && profile.skillsOffered.length > 0;
    const averageRating = profile.ratings.length > 0
        ? (profile.ratings.reduce((acc, item) => acc + item.rating, 0) / profile.ratings.length).toFixed(1)
        : 'No ratings yet';

    let profileImageSrc = `https://ui-avatars.com/api/?name=${profile.name.replace(/\s/g, '+')}&background=random`;
    if (profile.profilePhoto) {
        profileImageSrc = profile.profilePhoto.startsWith('/uploads/')
            ? `${serverUrl}${profile.profilePhoto}`
            : profile.profilePhoto;
    }

    return (
        <div style={{ padding: '2rem' }}>
            {/* Modal Backdrop for Swap */}
            {isRequestingSwap && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 50
                    }}
                    onClick={() => setIsRequestingSwap(false)}
                />
            )}

            {isRequestingSwap && loggedInUser && (
                <SwapRequestForm
                    loggedInUser={loggedInUser}
                    profileUser={profile}
                    onCancel={() => setIsRequestingSwap(false)}
                    onSubmit={handleSwapSubmit}
                />
            )}

            {isAvatarModalOpen && (
                <AvatarSelectionModal
                    onSelect={handleAvatarSelect}
                    onClose={() => setIsAvatarModalOpen(false)}
                    currentAvatar={profile.profilePhoto}
                />
            )}

            {isEditMode && isOwnProfile ? (
                <div>
                    {/* Avatar Preview */}
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <img
                            src={profileImageSrc}
                            alt="Avatar"
                            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    </div>

                    {/* Edit Form */}
                    <form onSubmit={handleSave} style={{
                        maxWidth: '500px',
                        margin: 'auto',
                        padding: '2rem',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        <h2 style={{ textAlign: 'center' }}>Edit Profile Details</h2>

                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleInputChange}
                        />

                        <label>About</label>
                        <textarea
                            name="about"
                            value={profile.about}
                            onChange={handleInputChange}
                            rows="3"
                        />

                        <label>Skills Offered (comma-separated)</label>
                        <input
                            type="text"
                            value={profile.skillsOffered.join(', ')}
                            onChange={(e) => handleSkillsChange(e, 'skillsOffered')}
                        />

                        <label>Skills Wanted (comma-separated)</label>
                        <input
                            type="text"
                            value={profile.skillsWanted.join(', ')}
                            onChange={(e) => handleSkillsChange(e, 'skillsWanted')}
                        />

                        <button type="submit">Save Details</button>
                    </form>

                    {/* Avatar Section */}
                    <div style={{
                        maxWidth: '500px',
                        margin: '2rem auto',
                        padding: '2rem',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        <h3>Update Profile Photo</h3>

                        <button onClick={() => setIsAvatarModalOpen(true)}>
                            Choose from Avatar Library
                        </button>

                        <hr />

                        <form onSubmit={handlePhotoUpload}>
                            <h4>Or Upload Your Own Photo</h4>
                            <input type="file" onChange={handleFileChange} />
                            <button type="submit">Upload Photo</button>
                        </form>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button onClick={() => setIsEditMode(false)}>Done Editing</button>
                    </div>
                </div>
            ) : (
                <div style={{ maxWidth: '600px', margin: 'auto', textAlign: 'center' }}>
                    <img src={profileImageSrc} alt="Profile" style={{ width: '100px', borderRadius: '50%' }} />
                    <h2>{profile.name}</h2>
                    <p>{profile.about}</p>
                    <p><strong>Average Rating:</strong> {averageRating}</p>
                    <p><strong>Skills Offered:</strong> {profile.skillsOffered.join(', ')}</p>
                    <p><strong>Skills Wanted:</strong> {profile.skillsWanted.join(', ')}</p>

                    {isOwnProfile && <button onClick={() => setIsEditMode(true)}>Edit Profile</button>}
                    {!isOwnProfile && canRequestSwap && <button onClick={() => setIsRequestingSwap(true)}>Request a Swap</button>}
                </div>
            )}
        </div>
    );
};

export default Profile;
