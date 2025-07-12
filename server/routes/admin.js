const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const User = require('../models/User');
const Swap = require('../models/Swap');

// GET /stats (unchanged)
router.get('/stats', [auth, admin], async (req, res) => { /* ... */ });

// GET /users (unchanged)
router.get('/users', [auth, admin], async (req, res) => { /* ... */ });

// PUT /users/:id/ban (unchanged)
router.put('/users/:id/ban', [auth, admin], async (req, res) => { /* ... */ });


// ===== START: NEW SWAP MANAGEMENT ROUTES =====

// @route   GET api/admin/swaps
// @desc    Get all swaps on the platform with pagination
// @access  Private, Admin
router.get('/swaps', [auth, admin], async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    try {
        const swaps = await Swap.find()
            .populate('requester', 'name email')
            .populate('requestee', 'name email')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Swap.countDocuments();
        
        res.json({
            swaps,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/admin/swaps/:id
// @desc    Admin delete a swap
// @access  Private, Admin
router.delete('/swaps/:id', [auth, admin], async (req, res) => {
    try {
        const swap = await Swap.findById(req.params.id);
        if (!swap) {
            return res.status(404).json({ msg: 'Swap not found' });
        }
        
        await swap.deleteOne(); // Mongoose 6+ uses deleteOne()
        
        res.json({ msg: 'Swap removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ===== END: NEW SWAP MANAGEMENT ROUTES =====

module.exports = router;