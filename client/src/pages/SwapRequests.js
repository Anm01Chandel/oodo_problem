import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import FeedbackModal from '../components/FeedbackModal';
import './SwapRequests.css';

const SwapRequests = () => {
    const { user } = useContext(AuthContext);
    const [swaps, setSwaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSwap, setSelectedSwap] = useState(null);

    const fetchSwaps = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/swaps`);
            setSwaps(res.data);
        } catch (err) {
            toast.error("Could not fetch swap requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSwaps();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/swaps/${id}`, { status });
            toast.success(`Request ${status}!`);
            fetchSwaps();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to update status.');
        }
    };
    
    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this request?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/swaps/${id}`);
                toast.success('Request cancelled.');
                fetchSwaps();
            } catch (err) {
                toast.error(err.response?.data?.msg || 'Failed to cancel request.');
            }
        }
    };

    const handleFeedbackSubmit = (updatedSwap) => {
        setSwaps(swaps.map(s => s._id === updatedSwap._id ? updatedSwap : s));
    };

    const isFeedbackNeeded = (swap) => {
        const isRequester = swap.requester._id === user._id;
        if (swap.status !== 'accepted' && swap.status !== 'completed') return false;
        if (isRequester && !swap.requesterRating) return true;
        if (!isRequester && !swap.requestedRating) return true;
        return false;
    }

    if (loading) return <p>Loading swap requests...</p>;

    const renderSwapCard = (swap, type) => (
        <div key={swap._id} className={`swap-card status-${swap.status}`}>
            <div className="swap-card-header">
                <img src={type === 'incoming' ? swap.requester.avatar : swap.requested.avatar} alt="avatar" />
                <div>
                    <p>
                        {type === 'incoming'
                            ? <><strong><Link to={`/profile/${swap.requester._id}`}>{swap.requester.name}</Link></strong> wants to swap with you.</>
                            : <>You requested a swap with <strong><Link to={`/profile/${swap.requested._id}`}>{swap.requested.name}</Link></strong>.</>
                        }
                    </p>
                    <p className="swap-details">
                        {type === 'incoming' ? 'They offer' : 'You offered'}: <strong>{swap.skillOfferedByRequester}</strong> <br/>
                        {type === 'incoming' ? 'They want' : 'You wanted'}: <strong>{swap.skillWantedByRequester}</strong>
                    </p>
                    {swap.requesterMessage && <p className="swap-message">"{swap.requesterMessage}"</p>}
                </div>
                <span className="status-badge">{swap.status}</span>
            </div>
            <div className="swap-actions">
                {type === 'incoming' && swap.status === 'pending' && (
                    <>
                        <button onClick={() => handleUpdateStatus(swap._id, 'accepted')} className="btn btn-success">Accept</button>
                        <button onClick={() => handleUpdateStatus(swap._id, 'rejected')} className="btn btn-danger">Reject</button>
                    </>
                )}
                {type === 'outgoing' && swap.status === 'pending' && (
                    <button onClick={() => handleCancel(swap._id)} className="btn btn-warning">Cancel Request</button>
                )}
                {isFeedbackNeeded(swap) && (
                    <button onClick={() => setSelectedSwap(swap)} className="btn btn-primary">Leave Feedback</button>
                )}
            </div>
        </div>
    );
    
    const incomingRequests = swaps.filter(s => s.requested._id === user?._id);
    const outgoingRequests = swaps.filter(s => s.requester._id === user?._id);

    return (
        <div className="swap-requests-container">
            <h1>My Swap Requests</h1>
            
            <div className="requests-section">
                <h2>Incoming Requests</h2>
                {incomingRequests.length > 0 ? incomingRequests.map(s => renderSwapCard(s, 'incoming')) : <p>No incoming requests.</p>}
            </div>

            <div className="requests-section">
                <h2>Outgoing Requests</h2>
                {outgoingRequests.length > 0 ? outgoingRequests.map(s => renderSwapCard(s, 'outgoing')) : <p>You haven't made any requests.</p>}
            </div>
            
            {selectedSwap && <FeedbackModal swap={selectedSwap} onFeedbackSubmit={handleFeedbackSubmit} onClose={() => setSelectedSwap(null)} />}
        </div>
    );
};

export default SwapRequests;