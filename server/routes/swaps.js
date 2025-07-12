const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Swap = require('../models/Swap');
const User = require('../models/User');

// @route   POST api/swaps
// @desc    Create a new swap request
// @access  Private
router.post('/', auth, async (req, res) => {
  const { requestedId, skillOffered, skillWanted, message } = req.body;
  
  try {
    const requestedUser = await User.findById(requestedId);
    if (!requestedUser) return res.status(404).json({ msg: 'Requested user not found' });

    const newSwap = new Swap({
      requester: req.user.id,
      requested: requestedId,
      skillOfferedByRequester: skillOffered,
      skillWantedByRequester: skillWanted,
      requesterMessage: message,
    });

    const swap = await newSwap.save();
    res.json(swap);
  } catch (e) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/swaps
// @desc    Get all swaps for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [{ requester: req.user.id }, { requested: req.user.id }],
    })
    .populate('requester', 'name avatar')
    .populate('requested', 'name avatar')
    .sort({ createdAt: -1 });

    res.json(swaps);
  } catch (e) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/swaps/:id
// @desc    Update a swap status (accept/reject)
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { status } = req.body; // should be 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status update' });
    }

    try {
        let swap = await Swap.findById(req.params.id);
        if (!swap) return res.status(404).json({ msg: 'Swap not found' });

        // Only the requested user can accept/reject
        if (swap.requested.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        
        if (swap.status !== 'pending') {
            return res.status(400).json({ msg: `Cannot change status of a swap that is already ${swap.status}`})
        }

        swap.status = status;
        await swap.save();
        res.json(swap);
    } catch (e) {
        res.status(500).json({ msg: 'Server Error' });
    }
});


// @route   DELETE api/swaps/:id
// @desc    Cancel a pending swap request
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let swap = await Swap.findById(req.params.id);
        if (!swap) return res.status(404).json({ msg: 'Swap not found' });

        // Only the requester can cancel a PENDING swap
        if (swap.requester.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        if (swap.status !== 'pending') {
            return res.status(400).json({ msg: 'Only pending swaps can be cancelled.'})
        }

        // We can either delete it or set status to 'cancelled'
        // Let's set status to 'cancelled' for record-keeping
        swap.status = 'cancelled';
        await swap.save();
        
        res.json({ msg: 'Swap cancelled successfully' });
    } catch (e) {
        if(e.kind === 'ObjectId') return res.status(404).json({ msg: 'Swap not found' });
        res.status(500).json({ msg: 'Server Error' });
    }
});


// @route   POST api/swaps/feedback/:id
// @desc    Add feedback to a completed swap
// @access  Private
router.post('/feedback/:id', auth, async (req, res) => {
    const { rating, feedback } = req.body;

    try {
        let swap = await Swap.findById(req.params.id);
        if (!swap) return res.status(404).json({ msg: 'Swap not found' });

        if (swap.status !== 'accepted') { // Can only give feedback on accepted swaps
             return res.status(400).json({ msg: 'Can only provide feedback on accepted swaps.' });
        }

        const isRequester = swap.requester.toString() === req.user.id;
        const isRequested = swap.requested.toString() === req.user.id;

        if (!isRequester && !isRequested) {
            return res.status(401).json({ msg: 'Not a participant of this swap.' });
        }

        if(isRequester) {
            swap.requesterRating = rating;
            swap.requesterFeedback = feedback;
        }

        if(isRequested) {
            swap.requestedRating = rating;
            swap.requestedFeedback = feedback;
        }

        // If both parties have given feedback, mark as completed.
        if(swap.requesterRating && swap.requestedRating) {
            swap.status = 'completed';
        }

        await swap.save();
        res.json(swap);
    } catch (e) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;