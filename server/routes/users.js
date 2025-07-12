const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer'); // Import multer
const path = require('path'); // Import path

// ===== START: MULTER CONFIGURATION =====
// Set up storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    // We use the user's ID to ensure a unique filename, and Date.now() to prevent caching issues
    cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Check File Type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('profilePhoto'); // 'profilePhoto' must match the name attribute in the frontend form
// ===== END: MULTER CONFIGURATION =====

// GET api/users (unchanged)
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

// GET api/users/:id (unchanged)
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('ratings.user', ['name']);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (!user.isPublic) return res.status(403).json({ msg: 'This profile is private' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId') return res.status(404).json({ msg: 'User not found' });
        res.status(500).send('Server Error');
    }
});

// PUT api/users/me (unchanged)
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
    let user = await User.findByIdAndUpdate(
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

// ===== START: NEW PHOTO UPLOAD ROUTE =====
// @route   POST api/users/me/photo
// @desc    Upload a profile photo
// @access  Private
router.post('/me/photo', auth, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ msg: err });
    }
    if (req.file == undefined) {
      return res.status(400).json({ msg: 'Error: No File Selected!' });
    }
    
    try {
      // The file path will be something like 'uploads/userid-12345.jpg'
      const photoUrl = `/uploads/${req.file.filename}`;
      
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { profilePhoto: photoUrl } },
        { new: true }
      ).select('-password');

      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
});
// ===== END: NEW PHOTO UPLOAD ROUTE =====

module.exports = router;