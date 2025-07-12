const User = require('../models/User');

async function admin(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ msg: 'Admin access required.' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Server error during admin check.' });
  }
}

module.exports = admin;