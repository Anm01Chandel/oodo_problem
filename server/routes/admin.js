const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const User = require('../models/User');
const Swap = require('../models/Swap');

// @route   GET api/admin/stats
// @desc    Get basic platform stats
// @access  Private, Admin
router.get('/stats', [auth, admin], async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const swapCount = await Swap.countDocuments();
        const pendingSwaps = await Swap.countDocuments({ status: 'pending' });

        res.json({
            users: userCount,
            totalSwaps: swapCount,
            pendingSwaps: pendingSwaps
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private, Admin
router.get('/users', [auth, admin], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ date: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/users/:id/ban
// @desc    Ban or unban a user
// @access  Private, Admin
router.put('/users/:id/ban', [auth, admin], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Prevent admin from banning themselves
        if (user.id === req.user.id) {
            return res.status(400).json({ msg: 'You cannot ban yourself.' });
        }

        user.isBanned = !user.isBanned; // Toggle the ban status
        await user.save();
        
        // Return the updated user document
        const updatedUser = await User.findById(req.params.id).select('-password');
        res.json({ msg: `User has been ${user.isBanned ? 'banned' : 'unbanned'}.`, user: updatedUser });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;