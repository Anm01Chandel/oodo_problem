import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Modal.css';

const FeedbackModal = ({ swap, onClose, onFeedbackSubmit }) => {
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/swaps/feedback/${swap._id}`, { rating, feedback });
            toast.success('Feedback submitted!');
            onFeedbackSubmit(res.data); // Update the parent component's state
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Could not submit feedback.');
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Leave Feedback for Your Swap</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Rating (1-5):</label>
                        <input type="number" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Feedback:</label>
                        <textarea
                            rows="4"
                            placeholder="How was your experience?"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-primary">Submit Feedback</button>
                        <button type="button" onClick={onClose} className="btn btn-light">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;