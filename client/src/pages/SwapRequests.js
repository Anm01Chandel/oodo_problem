import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './SwapRequests.css';
import { Link } from 'react-router-dom';

const SwapRequests = () => {
    const { user } = useContext(AuthContext);
    const [swaps, setSwaps] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSwaps = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/swaps`);
            setSwaps(res.data);
        } catch (err) {
            console.error(err);
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
            fetchSwaps(); // Refresh list
        } catch (err) {
            alert('Failed to update status: ' + err.response?.data?.msg);
        }
    };
    
    const handleCancel = async (id) => {
        if(window.confirm('Are you sure you want to cancel this request?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/swaps/${id}`);
                fetchSwaps(); // Refresh list
            } catch (err) {
                alert('Failed to cancel request: ' + err.response?.data?.msg);
            }
        }
    };


    const incomingRequests = swaps.filter(s => s.requested._id === user?._id);
    const outgoingRequests = swaps.filter(s => s.requester._id === user?._id);

    if (loading) return <p>Loading swap requests...</p>;

    return (
        <div className="swap-requests-container">
            <h1>My Swap Requests</h1>
            
            <div className="requests-section">
                <h2>Incoming Requests</h2>
                {incomingRequests.length > 0 ? (
                    incomingRequests.map(swap => (
                        <div key={swap._id} className={`swap-card status-${swap.status}`}>
                           <div className="swap-card-header">
                                <img src={swap.requester.avatar} alt="avatar" />
                                <div>
                                    <p><strong><Link to={`/profile/${swap.requester._id}`}>{swap.requester.name}</Link></strong> wants to swap with you.</p>
                                    <p className="swap-details">
                                        They offer: <strong>{swap.skillOfferedByRequester}</strong> <br/>
                                        They want: <strong>{swap.skillWantedByRequester}</strong>
                                    </p>
                                </div>
                                <span className="status-badge">{swap.status}</span>
                           </div>
                           {swap.status === 'pending' && (
                               <div className="swap-actions">
                                   <button onClick={() => handleUpdateStatus(swap._id, 'accepted')} className="btn btn-success">Accept</button>
                                   <button onClick={() => handleUpdateStatus(swap._id, 'rejected')} className="btn btn-danger">Reject</button>
                               </div>
                           )}
                        </div>
                    ))
                ) : (
                    <p>No incoming requests.</p>
                )}
            </div>

            <div className="requests-section">
                <h2>Outgoing Requests</h2>
                {outgoingRequests.length > 0 ? (
                    outgoingRequests.map(swap => (
                         <div key={swap._id} className={`swap-card status-${swap.status}`}>
                           <div className="swap-card-header">
                                <img src={swap.requested.avatar} alt="avatar" />
                                <div>
                                    <p>You requested a swap with <strong><Link to={`/profile/${swap.requested._id}`}>{swap.requested.name}</Link></strong>.</p>
                                    <p className="swap-details">
                                        You offered: <strong>{swap.skillOfferedByRequester}</strong> <br/>
                                        You wanted: <strong>{swap.skillWantedByRequester}</strong>
                                    </p>
                                </div>
                                <span className="status-badge">{swap.status}</span>
                           </div>
                           {swap.status === 'pending' && (
                               <div className="swap-actions">
                                   <button onClick={() => handleCancel(swap._id)} className="btn btn-warning">Cancel Request</button>
                               </div>
                           )}
                        </div>
                    ))
                ) : (
                    <p>You haven't made any requests.</p>
                )}
            </div>
        </div>
    );
};

export default SwapRequests;