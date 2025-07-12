const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/users
// @desc    Get all public user profiles (for browsing/searching)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { skill } = req.query;
    const query = { isPublic: true };

    if (skill) {
      query.$or = [
        { skillsOffered: { $regex: skill, $options: 'i' } },
        { skillsWanted: { $regex: skill, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('ratings.user', ['name']); // This line is updated

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        if (!user.isPublic) {
            // For a real app, you might want to check if the requester is the user themselves
            return res.status(403).json({ msg: 'This profile is private' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
});


// @route   PUT api/users/me
// @desc    Update logged-in user's profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  const { name, location, skillsOffered, skillsWanted, availability, isPublic } = req.body;
  
  const profileFields = {};
  if (name) profileFields.name = name;
  if (location !== undefined) profileFields.location = location;
  if (skillsOffered) profileFields.skillsOffered = skillsOffered;
  if (skillsWanted) profileFields.skillsWanted = skillsWanted;
  if (availability) profileFields.availability = availability;
  if (isPublic !== undefined) profileFields.isPublic = isPublic;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;