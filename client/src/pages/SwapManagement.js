import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SwapManagement = () => {
    const [data, setData] = useState({ swaps: [], totalPages: 1, currentPage: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);

    const fetchSwaps = async (currentPage) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/admin/swaps?page=${currentPage}&limit=10`, {
                headers: { 'x-auth-token': token }
            });
            setData(res.data);
        } catch (err) {
            setError('Failed to fetch swaps.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSwaps(page);
    }, [page]);

    const handleDelete = async (swapId) => {
        if (window.confirm('Are you sure you want to permanently delete this swap?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/admin/swaps/${swapId}`, {
                    headers: { 'x-auth-token': token }
                });
                // Refresh the list after deletion
                fetchSwaps(page);
            } catch (err) {
                alert(`Error: ${err.response.data.msg || 'Action failed.'}`);
            }
        }
    };
    
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= data.totalPages) {
            setPage(newPage);
        }
    };

    if (loading) return <div>Loading swaps...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <Link to="/admin">← Back to Admin Dashboard</Link>
            <h2 style={{marginTop: '1rem'}}>Swap Management</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #333', backgroundColor: '#f2f2f2' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Requester</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Requestee</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.swaps.map(swap => (
                        <tr key={swap._id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '12px' }}>{swap.requester ? swap.requester.name : 'N/A'}</td>
                            <td style={{ padding: '12px' }}>{swap.requestee ? swap.requestee.name : 'N/A'}</td>
                            <td style={{ padding: '12px' }}>{swap.status}</td>
                            <td style={{ padding: '12px' }}>{new Date(swap.date).toLocaleDateString()}</td>
                            <td style={{ padding: '12px' }}>
                                <button onClick={() => handleDelete(swap._id)} style={{ backgroundColor: '#F08080' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>« Previous</button>
                <span style={{ margin: '0 1rem' }}>Page {data.currentPage} of {data.totalPages}</span>
                <button onClick={() => handlePageChange(page + 1)} disabled={page === data.totalPages}>Next »</button>
            </div>
        </div>
    );
};

export default SwapManagement;