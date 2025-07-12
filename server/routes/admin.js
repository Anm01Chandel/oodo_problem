const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const User = require('../models/User');
const Swap = require('../models/Swap');

// All routes here are protected and require admin role
router.use(auth, admin);

// @route   GET api/admin/users
// @desc    Get all users (for admin)
// @access  Admin
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ register_date: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/users/:id/ban
// @desc    Ban or unban a user
// @access  Admin
router.put('/users/:id/ban', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        user.isBanned = !user.isBanned;
        await user.save();
        res.json({ msg: `User has been ${user.isBanned ? 'banned' : 'unbanned'}.`, user });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/swaps
// @desc    Get all swaps (for admin)
// @access  Admin
router.get('/swaps', async (req, res) => {
    try {
        const swaps = await Swap.find()
            .populate('requester', 'name email')
            .populate('requested', 'name email')
            .sort({ createdAt: -1 });
        res.json(swaps);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/reports/users
// @desc    Download user activity report as CSV
// @access  Admin
router.get('/reports/users', async (req, res) => {
    try {
        const users = await User.find().lean();
        const fields = ['_id', 'name', 'email', 'role', 'location', 'isPublic', 'isBanned', 'register_date'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(users);

        res.header('Content-Type', 'text/csv');
        res.attachment('user_report.csv');
        res.send(csv);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/reports/swaps
// @desc    Download swaps report as CSV
// @access  Admin
router.get('/reports/swaps', async (req, res) => {
    try {
        const swaps = await Swap.find().populate('requester', 'email').populate('requested', 'email').lean();
        
        const data = swaps.map(s => ({
            swap_id: s._id,
            requester_email: s.requester.email,
            requested_email: s.requested.email,
            status: s.status,
            created_at: s.createdAt,
            updated_at: s.updatedAt,
            skill_offered: s.skillOfferedByRequester,
            skill_wanted: s.skillWantedByRequester,
            requester_rating: s.requesterRating,
            requested_rating: s.requestedRating
        }));
        
        const fields = Object.keys(data[0] || {});
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(data);

        res.header('Content-Type', 'text/csv');
        res.attachment('swaps_report.csv');
        res.send(csv);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;