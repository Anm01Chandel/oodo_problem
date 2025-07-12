import React from 'react';
import './AvatarSelectionModal.css';

const avatars = Array.from({ length: 12 }, (_, i) => `/avatars/avatar_${i + 1}.png`);

const AvatarSelectionModal = ({ onSelect, onClose }) => {
    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Choose an Avatar</h2>
                <div className="avatar-grid">
                    {avatars.map((avatar, index) => (
                        <img
                            key={index}
                            src={avatar}
                            alt={`Avatar ${index + 1}`}
                            className="avatar-option"
                            onClick={() => onSelect(avatar)}
                        />
                    ))}
                </div>
                <button onClick={onClose} className="btn btn-light" style={{marginTop: '1rem'}}>Close</button>
            </div>
        </div>
    );
};

export default AvatarSelectionModal;