import React, { useState } from 'react';

const AvatarSelectionModal = ({ onSelect, onClose, currentAvatar }) => {
    const avatars = Array.from({ length: 10 }, (_, i) =>
        `/avatars/avatar_${String(i + 1).padStart(3, '0')}.png`
    );

    const [searchTerm, setSearchTerm] = useState('');

    const filteredAvatars = avatars.filter(path =>
        path.includes(searchTerm)
    );

    return (
        <div style={modalBackdrop}>
            <div style={modalStyle}>
                <h2 style={{ marginBottom: '1rem' }}>Choose an Avatar</h2>
                <input
                    type="text"
                    placeholder="Search by number (e.g., 003)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={searchBox}
                />

                <div style={gridContainer}>
                    {filteredAvatars.map((avatar, i) => (
                        <img
                            key={i}
                            src={avatar}
                            alt={`avatar-${i}`}
                            style={{
                                ...avatarImage,
                                border: avatar === currentAvatar ? '3px solid #4A90E2' : '1px solid #ccc'
                            }}
                            onClick={() => onSelect(avatar)}
                        />
                    ))}
                </div>

                <button onClick={onClose} style={closeBtn}>Cancel</button>
            </div>
        </div>
    );
};

export default AvatarSelectionModal;

// 🔽 Styles

const modalBackdrop = {
    position: 'fixed',
    top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000
};

const modalStyle = {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '90%',
    textAlign: 'center',
    position: 'relative'
};

const searchBox = {
    padding: '0.5rem',
    width: '100%',
    marginBottom: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc'
};

const gridContainer = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
};

const avatarImage = {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    objectFit: 'cover',
    cursor: 'pointer',
    transition: 'transform 0.2s',
};

const closeBtn = {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer'
};
