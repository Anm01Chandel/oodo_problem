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

  if (!skillOffered || !skillWanted) {
    return res.status(400).json({ msg: 'Please select both a skill to offer and a skill you want.' });
  }

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
// @desc    Update swap status (accept, reject, cancel, complete)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body;
  try {
    let swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ msg: 'Swap not found' });

    const isRequestee = swap.requestee.toString() === req.user.id;
    const isRequester = swap.requester.toString() === req.user.id;
    if (!isRequestee && !isRequester) return res.status(401).json({ msg: 'User not authorized' });
    
    if (status === 'accepted' || status === 'rejected') {
        if (!isRequestee) return res.status(401).json({ msg: 'Only the requestee can accept or reject' });
    } else if (status === 'cancelled') {
        if (!isRequester || swap.status !== 'pending') return res.status(401).json({ msg: 'Only the requester can cancel a pending request' });
    } else if (status === 'completed') {
        if (swap.status !== 'accepted') return res.status(400).json({ msg: 'Only accepted swaps can be marked as completed' });
    } else {
        return res.status(400).json({ msg: 'Invalid status update' });
    }
    
    swap = await Swap.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
    res.json(swap);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/swaps/:id/rate
// @desc    Rate the other user in a completed swap
// @access  Private
router.post('/:id/rate', auth, async (req, res) => {
  const { rating, feedback } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ msg: 'Please provide a rating between 1 and 5.' });
  }

  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ msg: 'Swap not found.' });
    if (swap.status !== 'completed') return res.status(400).json({ msg: 'Can only rate completed swaps.' });

    const isRequester = swap.requester.toString() === req.user.id;
    const isRequestee = swap.requestee.toString() === req.user.id;

    if (!isRequester && !isRequestee) {
      return res.status(401).json({ msg: 'You were not a part of this swap.' });
    }
    
    let userToRateId;
    let fieldToUpdate;

    if (isRequester) {
      if (swap.requesterHasRated) return res.status(400).json({ msg: 'You have already rated this swap.' });
      userToRateId = swap.requestee;
      fieldToUpdate = { requesterHasRated: true };
    } else { // isRequestee
      if (swap.requesteeHasRated) return res.status(400).json({ msg: 'You have already rated this swap.' });
      userToRateId = swap.requester;
      fieldToUpdate = { requesteeHasRated: true };
    }

    const userToRate = await User.findById(userToRateId);
    userToRate.ratings.unshift({
      user: req.user.id,
      rating: Number(rating),
      feedback,
    });
    await userToRate.save();

    await Swap.findByIdAndUpdate(req.params.id, { $set: fieldToUpdate });

    res.json({ msg: 'Rating submitted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;