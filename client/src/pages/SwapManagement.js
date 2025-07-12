import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const SwapManagement = () => {
    const [swaps, setSwaps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSwaps = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/swaps`);
                setSwaps(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSwaps();
    }, []);

    if (loading) return <p>Loading swaps...</p>;

    return (
        <div className="admin-container">
            <h1>All Platform Swaps</h1>
             <table className="admin-table">
                <thead>
                    <tr>
                        <th>Requester</th>
                        <th>Requested</th>
                        <th>Status</th>
                        <th>Skill Offered</th>
                        <th>Skill Wanted</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {swaps.map(swap => (
                        <tr key={swap._id}>
                            <td>{swap.requester.name} ({swap.requester.email})</td>
                            <td>{swap.requested.name} ({swap.requested.email})</td>
                            <td><span className={`status-badge-table status-${swap.status}`}>{swap.status}</span></td>
                            <td>{swap.skillOfferedByRequester}</td>
                            <td>{swap.skillWantedByRequester}</td>
                            <td>{new Date(swap.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SwapManagement;