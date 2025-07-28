const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
    maxlength: [50000, 'Content cannot be more than 50,000 characters']
  },
  category: {
    type: String,
    default: '',
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, category: 1 });
noteSchema.index({ userId: 1, title: 'text', content: 'text' });

// Virtual for word count
noteSchema.virtual('wordCount').get(function() {
  const titleWords = (this.title || '').split(/\s+/).filter(word => word.length > 0).length;
  const contentWords = (this.content || '').split(/\s+/).filter(word => word.length > 0).length;
  return titleWords + contentWords;
});

// Pre-save middleware to update lastModified
noteSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Static method to search notes
noteSchema.statics.searchNotes = function(userId, query, options = {}) {
  const { category, dateFrom, dateTo, sortBy = 'lastModified', sortOrder = 'desc', limit = 50 } = options;
  
  let searchQuery = { userId };
  
  // Text search
  if (query && query.trim()) {
    searchQuery.$text = { $search: query };
  }
  
  // Category filter
  if (category) {
    searchQuery.category = category;
  }
  
  // Date range filter
  if (dateFrom || dateTo) {
    searchQuery.createdAt = {};
    if (dateFrom) searchQuery.createdAt.$gte = new Date(dateFrom);
    if (dateTo) searchQuery.createdAt.$lte = new Date(dateTo);
  }
  
  // Build sort object
  const sortObject = {};
  sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  return this.find(searchQuery)
    .sort(sortObject)
    .limit(limit)
    .populate('userId', 'username email');
};

// Instance method to get note statistics
noteSchema.methods.getStats = function() {
  return {
    wordCount: this.wordCount,
    characterCount: this.content.length,
    lineCount: this.content.split('\n').length,
    lastModified: this.lastModified
  };
};

module.exports = mongoose.model('Note', noteSchema); 