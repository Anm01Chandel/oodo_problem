import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SwapRequests = () => {
    const [swaps, setSwaps] = useState([]);
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const token = localStorage.getItem('token');

    const fetchSwaps = async () => {
        if (!token) return;
        try {
            const config = { headers: { 'x-auth-token': token } };
            // First, get the logged-in user's ID
            const userRes = await axios.get('http://localhost:5000/api/auth', config);
            setLoggedInUserId(userRes.data._id);
            
            // Then, get their swaps
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
            // Refresh the list after update
            fetchSwaps();
        } catch (err) {
            console.error('Error updating swap status:', err.response.data);
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
        <div>
            <h2>My Swap Requests</h2>

            <h3>Incoming Requests</h3>
            {incomingRequests.length > 0 ? incomingRequests.map(swap => (
                <div key={swap._id} style={cardStyle}>
                    <p>From: <strong>{swap.requester.name}</strong></p>
                    <p>They offer: <strong>{swap.skillOffered}</strong></p>
                    <p>They want: <strong>{swap.skillWanted}</strong></p>
                    <p>Status: <strong>{swap.status}</strong></p>
                    {swap.status === 'pending' && (
                        <div>
                            <button onClick={() => handleUpdateStatus(swap._id, 'accepted')}>Accept</button>
                            <button onClick={() => handleUpdateStatus(swap._id, 'rejected')}>Reject</button>
                        </div>
                    )}
                </div>
            )) : <p>No incoming requests.</p>}

            <h3>Outgoing Requests</h3>
            {outgoingRequests.length > 0 ? outgoingRequests.map(swap => (
                <div key={swap._id} style={cardStyle}>
                    <p>To: <strong>{swap.requestee.name}</strong></p>
                    <p>You offer: <strong>{swap.skillOffered}</strong></p>
                    <p>You want: <strong>{swap.skillWanted}</strong></p>
                    <p>Status: <strong>{swap.status}</strong></p>
                    {swap.status === 'pending' && (
                        <button onClick={() => handleUpdateStatus(swap._id, 'cancelled')}>Cancel Request</button>
                    )}
                </div>
            )) : <p>No outgoing requests sent.</p>}
        </div>
    );
};

export default SwapRequests;