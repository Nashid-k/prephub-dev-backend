import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  picture: {
    type: String
  },

  // Onboarding fields
  username: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  goals: [{
    type: String,
    enum: ['practice', 'placements', 'interviews', 'learn', 'portfolio']
  }],
  skills: [{
    type: String
  }],

  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  emailPreferences: {
    weeklySummary: {
      type: Boolean,
      default: true
    },
    lastEmailSent: {
      type: Date
    },
    unsubscribeToken: {
      type: String,
      default: () => crypto.randomBytes(32).toString('hex')
    }
  }
});

// Index for username lookup
userSchema.index({ username: 1 });

export default mongoose.model('User', userSchema);
