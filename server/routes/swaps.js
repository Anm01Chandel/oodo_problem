const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Swap = require('../models/Swap');
const User = require('../models/User');

// @route   POST api/swaps
// @desc    Create a new swap request
// @access  Private
router.post('/', auth, async (req, res) => {
  const { requesteeId, skillOffered, skillWanted, message } = req.body;

  try {
    const requester = await User.findById(req.user.id);
    const requestee = await User.findById(requesteeId);

    if (!requestee) {
      return res.status(404).json({ msg: 'User to swap with not found' });
    }

    const newSwap = new Swap({
      requester: req.user.id,
      requestee: requesteeId,
      skillOffered,
      skillWanted,
      message,
    });

    const swap = await newSwap.save();
    res.json(swap);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/swaps/me
// @desc    Get all swaps involving the current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [{ requester: req.user.id }, { requestee: req.user.id }],
    })
    .populate('requester', ['name', 'profilePhoto'])
    .populate('requestee', ['name', 'profilePhoto'])
    .sort({ date: -1 });

    res.json(swaps);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/swaps/:id
// @desc    Update swap status (accept, reject, cancel)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body; // 'accepted', 'rejected', 'cancelled'

  try {
    let swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ msg: 'Swap not found' });
    }

    // Check if user is authorized to update
    const isRequestee = swap.requestee.toString() === req.user.id;
    const isRequester = swap.requester.toString() === req.user.id;

    if (!isRequestee && !isRequester) {
        return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Logic for who can change to what status
    if (status === 'accepted' || status === 'rejected') {
        if (!isRequestee) return res.status(401).json({ msg: 'Only the requestee can accept or reject' });
    } else if (status === 'cancelled') {
        if (!isRequester) return res.status(401).json({ msg: 'Only the requester can cancel' });
    } else {
        return res.status(400).json({ msg: 'Invalid status update' });
    }


    swap = await Swap.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    res.json(swap);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;