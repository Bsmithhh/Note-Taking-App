const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot be more than 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    },
    autoSave: {
      type: Boolean,
      default: true
    },
    backupFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user statistics
userSchema.virtual('stats').get(async function() {
  const Note = mongoose.model('Note');
  const Category = mongoose.model('Category');
  
  const [noteCount, categoryCount] = await Promise.all([
    Note.countDocuments({ userId: this._id }),
    Category.countDocuments({ userId: this._id })
  ]);
  
  return {
    noteCount,
    categoryCount,
    memberSince: this.createdAt,
    lastLogin: this.lastLogin
  };
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to create default categories for new user
userSchema.statics.createDefaultCategories = async function(userId) {
  const Category = mongoose.model('Category');
  const defaultCategories = [
    { name: 'Personal', color: '#FF6B6B', icon: '👤' },
    { name: 'Work', color: '#4ECDC4', icon: '💼' },
    { name: 'Study', color: '#45B7D1', icon: '📚' },
    { name: 'Ideas', color: '#96CEB4', icon: '💡' },
    { name: 'Archive', color: '#FFEAA7', icon: '📦' }
  ];
  
  const categories = defaultCategories.map(cat => ({
    ...cat,
    userId,
    isDefault: true
  }));
  
  return Category.insertMany(categories);
};

module.exports = mongoose.model('User', userSchema); 