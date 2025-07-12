import React, { useState, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AuthContext from '../context/AuthContext';
import './Modal.css'; // We will create a shared modal CSS file

const SwapRequestModal = ({ profileUser, onClose }) => {
    const { user: authUser } = useContext(AuthContext);

    const [skillOffered, setSkillOffered] = useState('');
    const [skillWanted, setSkillWanted] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!skillOffered || !skillWanted) {
            return toast.error('Please select a skill to offer and a skill you want.');
        }

        const swapData = {
            requestedId: profileUser._id,
            skillOfferedByRequester: skillOffered,
            skillWantedByRequester: skillWanted,
            requesterMessage: message,
        };

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/swaps`, swapData);
            toast.success('Swap request sent successfully!');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Could not send swap request.');
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Request a Swap with {profileUser.name}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select one of your offered skills:</label>
                        <select value={skillOffered} onChange={(e) => setSkillOffered(e.target.value)} required>
                            <option value="" disabled>-- Select a skill --</option>
                            {authUser.skillsOffered.map((skill, i) => (
                                <option key={i} value={skill}>{skill}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Select one of their offered skills:</label>
                        <select value={skillWanted} onChange={(e) => setSkillWanted(e.target.value)} required>
                            <option value="" disabled>-- Select a skill --</option>
                            {profileUser.skillsOffered.map((skill, i) => (
                                <option key={i} value={skill}>{skill}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Message (optional):</label>
                        <textarea
                            rows="4"
                            placeholder="Introduce yourself and propose the swap..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-primary">Send Request</button>
                        <button type="button" onClick={onClose} className="btn btn-light">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SwapRequestModal;