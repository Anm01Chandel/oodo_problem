const mongoose = require('mongoose');

const SwapSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requested: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skillOfferedByRequester: {
    type: String,
    required: true,
  },
  skillWantedByRequester: { // This is the skill from the 'requested' user's profile
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
  },
  requesterMessage: {
    type: String,
    maxlength: 500,
  },
  // Feedback fields
  requesterRating: { type: Number, min: 1, max: 5 },
  requesterFeedback: { type: String },
  requestedRating: { type: Number, min: 1, max: 5 },
  requestedFeedback: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Swap', SwapSchema);