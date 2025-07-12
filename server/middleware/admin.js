const User = require('../models/User');

// This middleware should be used AFTER the auth middleware
const admin = async (req, res, next) => {
    try {
        // req.user is attached by the preceding 'auth' middleware
        const user = await User.findById(req.user.id);

        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ msg: 'Access denied. Not an admin.' });
        }
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

module.exports = admin;