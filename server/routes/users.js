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
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // CORRECTED LOGIC: Create a new user instance.
    // The password here is plain text. The pre-save hook in User.js will hash it.
    user = new User({
      name,
      email,
      password,
    });

    // Now, save the user to the database. This triggers the pre-save hook.
    await user.save();

    // If save is successful, create the JWT token
    const payload = {
      id: user.id,
      role: user.role,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 * 24 }, // 24 hours
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
        });
      }
    );
  } catch (err) {
    // This will now catch any errors from the .save() operation and log them
    console.error('--- REGISTRATION ERROR ---');
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error during registration.' });
  }
});


// (The rest of the file remains the same but is included for completeness)

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
    console.error(e.message);
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
        console.error(e.message);
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

    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (location || location === '') updatedFields.location = location;
    if (availability || availability === '') updatedFields.availability = availability;
    if (skillsOffered) updatedFields.skillsOffered = skillsOffered;
    if (skillsWanted) updatedFields.skillsWanted = skillsWanted;
    if (isPublic !== undefined) updatedFields.isPublic = isPublic;
    if (avatar) updatedFields.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;