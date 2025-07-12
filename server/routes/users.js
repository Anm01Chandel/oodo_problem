const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/users
// @desc    Register new user
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const newUser = new User({ name, email, password });
    user = await newUser.save();

    jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
        });
      }
    );
  } catch (e) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/users
// @desc    Get all public user profiles (for browsing)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { skill } = req.query;
    let query = { isPublic: true, isBanned: false, role: 'user' };

    if (skill) {
      query.skillsOffered = { $regex: skill, $options: 'i' };
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (e) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/users/profile/:id
// @desc    Get a user's profile by ID
// @access  Public
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user || (!user.isPublic && user.role !== 'admin')) {
            return res.status(404).json({ msg: 'User not found or profile is private' });
        }
        res.json(user);
    } catch (e) {
        if (e.kind === 'ObjectId') {
             return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).json({ msg: 'Server Error' });
    }
});


// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, location, availability, skillsOffered, skillsWanted, isPublic, avatar } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Build user object
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (location) updatedFields.location = location;
    if (availability) updatedFields.availability = availability;
    if (skillsOffered) updatedFields.skillsOffered = skillsOffered;
    if (skillsWanted) updatedFields.skillsWanted = skillsWanted;
    if (isPublic !== undefined) updatedFields.isPublic = isPublic;
    if (avatar) updatedFields.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields },
      { new: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (e) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;