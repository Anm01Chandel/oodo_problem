import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AuthContext from '../context/AuthContext';
import AvatarSelectionModal from '../components/AvatarSelectionModal';
import SwapRequestModal from '../components/SwapRequestModal';
import './Profile.css';

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: authUser, loadUser } = useContext(AuthContext);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMyProfile, setIsMyProfile] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [showSwapModal, setShowSwapModal] = useState(false);

    const loadProfileData = (data) => {
        setProfile(data);
        // Populate form for editing
        setFormData({
            name: data.name,
            location: data.location || '',
            availability: data.availability || '',
            skillsOffered: data.skillsOffered.join(', '),
            skillsWanted: data.skillsWanted.join(', '),
            isPublic: data.isPublic,
            avatar: data.avatar
        });
    };
    
    useEffect(() => {
        const profileId = id || 'me'; // If no ID, it's the auth user's profile
        if (profileId === 'me' && !authUser) {
             navigate('/login');
             return;
        }

        const fetchProfile = async () => {
            setLoading(true);
            try {
                const url = profileId === 'me'
                    ? `${process.env.REACT_APP_API_URL}/api/auth/user`
                    : `${process.env.REACT_APP_API_URL}/api/users/profile/${profileId}`;
                
                const res = await axios.get(url);
                loadProfileData(res.data);
                setIsMyProfile(authUser?._id === res.data._id);
                
            } catch (err) {
                toast.error(err.response?.data?.msg || 'Could not load profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id, authUser, navigate]);

    const onChange = e => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleAvatarSelect = (avatarPath) => {
        setFormData({ ...formData, avatar: avatarPath });
        setShowAvatarModal(false);
    };

    const onSubmit = async e => {
        e.preventDefault();
        // **FIXED**: Convert comma-separated strings to arrays, filtering out empty strings
        const body = {
            ...formData,
            skillsOffered: formData.skillsOffered.split(',').map(s => s.trim()).filter(s => s.length > 0),
            skillsWanted: formData.skillsWanted.split(',').map(s => s.trim()).filter(s => s.length > 0),
        };

        try {
            const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/profile`, body);
            loadProfileData(res.data);
            setEditMode(false);
            loadUser(); // Refresh auth context user to update navbar/skills
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to update profile');
        }
    };

    if (loading) return <div>Loading Profile...</div>;
    if (!profile) return <div>Profile not found.</div>;
    
    const handleRequestSwap = () => {
        if (!authUser) {
            toast.error("Please log in to request a swap.");
            return navigate('/login');
        }
        if (authUser.skillsOffered.length === 0) {
            return toast.error("You must add skills to your profile before requesting a swap.", { duration: 4000 });
        }
        setShowSwapModal(true);
    };

    const renderProfileView = () => (
        <div className="profile-grid">
            <div className="profile-left">
                <img src={profile.avatar} alt="avatar" className="profile-avatar" />
                <h2>{profile.name}</h2>
                <p>{profile.location || 'Location not specified'}</p>
                {isMyProfile && <button onClick={() => setEditMode(true)} className="btn btn-primary">Edit Profile</button>}
                {!isMyProfile && <button onClick={handleRequestSwap} className="btn btn-success">Request Swap</button>}
            </div>
            <div className="profile-right">
                <h3>Availability</h3>
                <p>{profile.availability || 'Not specified'}</p>
                <hr />
                <h3>Skills Offered</h3>
                <div className="skills-list">
                    {profile.skillsOffered.length > 0 ? profile.skillsOffered.map((s, i) => <span key={i} className="skill-tag">{s}</span>) : <p>None specified</p>}
                </div>
                <hr />
                <h3>Skills Wanted</h3>
                <div className="skills-list">
                     {profile.skillsWanted.length > 0 ? profile.skillsWanted.map((s, i) => <span key={i} className="skill-tag-wanted">{s}</span>) : <p>None specified</p>}
                </div>
            </div>
        </div>
    );

    const renderEditView = () => (
         <div className="form-container">
            <h2>Edit Profile</h2>
            <form onSubmit={onSubmit}>
                <div style={{textAlign: 'center', marginBottom: '1rem'}}>
                    <img src={formData.avatar} alt="selected avatar" className="profile-avatar-edit" />
                    <button type="button" onClick={() => setShowAvatarModal(true)} className="btn btn-light">Change Avatar</button>
                </div>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value={formData.name} onChange={onChange} required/>
                </div>
                <div className="form-group">
                    <label>Location (optional)</label>
                    <input type="text" name="location" value={formData.location} onChange={onChange} />
                </div>
                <div className="form-group">
                    <label>Availability (optional)</label>
                    <input type="text" name="availability" placeholder="e.g., Weekends, Evenings" value={formData.availability} onChange={onChange} />
                </div>
                <div className="form-group">
                    <label>Skills Offered (comma-separated)</label>
                    <textarea name="skillsOffered" value={formData.skillsOffered} onChange={onChange}></textarea>
                </div>
                <div className="form-group">
                    <label>Skills Wanted (comma-separated)</label>
                    <textarea name="skillsWanted" value={formData.skillsWanted} onChange={onChange}></textarea>
                </div>
                <div className="form-group-inline">
                    <label>Profile is Public</label>
                    <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={onChange} />
                </div>
                <div className="edit-buttons">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button type="button" onClick={() => setEditMode(false)} className="btn btn-light">Cancel</button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="profile-container">
            {editMode ? renderEditView() : renderProfileView()}
            {showAvatarModal && <AvatarSelectionModal onSelect={handleAvatarSelect} onClose={() => setShowAvatarModal(false)} />}
            {showSwapModal && <SwapRequestModal profileUser={profile} onClose={() => setShowSwapModal(false)} />}
        </div>
    );
};

export default Profile;