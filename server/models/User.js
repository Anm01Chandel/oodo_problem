const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: '',
  },
  profilePhoto: {
    type: String,
    default: '', // URL to the photo
  },
  skillsOffered: [{
    type: String,
  }],
  skillsWanted: [{
    type: String,
  }],
  availability: {
    type: String,
    default: 'Not specified', // e.g., "Weekends", "Evenings"
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    feedback: String,
  }],
  date: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);