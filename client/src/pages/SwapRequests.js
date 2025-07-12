import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RatingModal = ({ swap, onSubmit, onCancel }) => {
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(swap._id, { rating, feedback });
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '1000' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px' }}>
                <h3>Leave Feedback</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Rating (1-5):</label>
                        <input type="number" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Feedback:</label>
                        <textarea value={feedback} onChange={e => setFeedback(e.target.value)} style={{ width: '100%', minHeight: '100px', padding: '8px', boxSizing: 'border-box' }}></textarea>
                    </div>
                    <button type="submit">Submit Feedback</button>
                    <button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

const SwapRequests = () => {
    const [swaps, setSwaps] = useState([]);
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [ratingSwap, setRatingSwap] = useState(null);
    const token = localStorage.getItem('token');

    const fetchSwaps = async () => {
        if (!token) return;
        try {
            const config = { headers: { 'x-auth-token': token } };
            const userRes = await axios.get('http://localhost:5000/api/auth', config);
            setLoggedInUserId(userRes.data._id);
            
            const swapsRes = await axios.get('http://localhost:5000/api/swaps/me', config);
            setSwaps(swapsRes.data);
        } catch (err) {
            console.error('Error fetching swaps:', err);
        }
    };

    useEffect(() => {
        fetchSwaps();
    }, [token]);

    const handleUpdateStatus = async (swapId, newStatus) => {
        try {
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5000/api/swaps/${swapId}`, { status: newStatus }, config);
            fetchSwaps();
        } catch (err) {
            alert(`Error: ${err.response.data.msg}`);
        }
    };

    const handleRatingSubmit = async (swapId, ratingData) => {
        try {
            const config = { headers: { 'x-auth-token': token } };
            await axios.post(`http://localhost:5000/api/swaps/${swapId}/rate`, ratingData, config);
            setRatingSwap(null);
            fetchSwaps();
            alert('Feedback submitted!');
        } catch (err) {
            alert(`Error: ${err.response.data.msg}`);
        }
    };
    
    const renderActionButtons = (swap) => {
        const isRequester = swap.requester._id === loggedInUserId;
        switch (swap.status) {
            case 'pending':
                return isRequester ? 
                    <button onClick={() => handleUpdateStatus(swap._id, 'cancelled')}>Cancel Request</button> :
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button onClick={() => handleUpdateStatus(swap._id, 'accepted')}>Accept</button>
                        <button onClick={() => handleUpdateStatus(swap._id, 'rejected')}>Reject</button>
                    </div>;
            case 'accepted':
                return <button onClick={() => handleUpdateStatus(swap._id, 'completed')}>Mark as Completed</button>;
            case 'completed':
                const hasRated = isRequester ? swap.requesterHasRated : swap.requesteeHasRated;
                return hasRated ? 
                    <span style={{color: 'green'}}>Feedback Submitted</span> : 
                    <button onClick={() => setRatingSwap(swap)}>Leave Feedback</button>;
            default:
                return null;
        }
    };

    const cardStyle = {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        margin: '1rem 0',
        backgroundColor: '#f9f9f9'
    };

    const incomingRequests = swaps.filter(swap => swap.requestee._id === loggedInUserId);
    const outgoingRequests = swaps.filter(swap => swap.requester._id === loggedInUserId);

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
            {ratingSwap && <RatingModal swap={ratingSwap} onSubmit={handleRatingSubmit} onCancel={() => setRatingSwap(null)} />}
            
            <h2>My Swap Requests</h2>

            <h3>Incoming Requests</h3>
            {incomingRequests.length > 0 ? incomingRequests.map(swap => (
                <div key={swap._id} style={cardStyle}>
                    <p>From: <strong>{swap.requester.name}</strong></p>
                    <p>They offer: <strong>{swap.skillOffered}</strong> | They want: <strong>{swap.skillWanted}</strong></p>
                    <p>Status: <strong>{swap.status}</strong></p>
                    {renderActionButtons(swap)}
                </div>
            )) : <p>No incoming requests.</p>}

            <h3>Outgoing Requests</h3>
            {outgoingRequests.length > 0 ? outgoingRequests.map(swap => (
                <div key={swap._id} style={cardStyle}>
                    <p>To: <strong>{swap.requestee.name}</strong></p>
                    <p>You offer: <strong>{swap.skillOffered}</strong> | You want: <strong>{swap.skillWanted}</strong></p>
                    <p>Status: <strong>{swap.status}</strong></p>
                    {renderActionButtons(swap)}
                </div>
            )) : <p>No outgoing requests sent.</p>}
        </div>
    );
};

export default SwapRequests;