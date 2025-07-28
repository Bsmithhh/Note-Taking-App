const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    default: '',
    maxlength: [50000, 'Content cannot exceed 50,000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  color: {
    type: String,
    default: '#ffffff',
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    wordCount: {
      type: Number,
      default: 0
    },
    characterCount: {
      type: Number,
      default: 0
    },
    readingTime: {
      type: Number,
      default: 0
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  version: {
    type: Number,
    default: 1
  },
  history: [{
    content: String,
    title: String,
    editedAt: {
      type: Date,
      default: Date.now
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted date
noteSchema.virtual('formattedDate').get(function() {
  return this.updatedAt.toLocaleDateString();
});

// Virtual for time ago
noteSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInMinutes = Math.floor((now - this.updatedAt) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
});

// Virtual for preview content
noteSchema.virtual('preview').get(function() {
  if (!this.content) return '';
  const textContent = this.content.replace(/<[^>]*>/g, '');
  return textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;
});

// Indexes for better query performance
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, updatedAt: -1 });
noteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ userId: 1, category: 1 });
noteSchema.index({ userId: 1, tags: 1 });
noteSchema.index({ userId: 1, isArchived: 1 });
noteSchema.index({ title: 'text', content: 'text' });

// Pre-save middleware to update metadata
noteSchema.pre('save', function(next) {
  // Update word and character count
  const textContent = this.content.replace(/<[^>]*>/g, '');
  this.metadata.wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  this.metadata.characterCount = textContent.length;
  this.metadata.readingTime = Math.ceil(this.metadata.wordCount / 200); // Average reading speed
  
  // Increment version if content changed
  if (this.isModified('content') || this.isModified('title')) {
    this.version += 1;
  }
  
  next();
});

// Instance method to add to history
noteSchema.methods.addToHistory = function() {
  if (this.history.length >= 10) {
    this.history.shift(); // Remove oldest entry
  }
  
  this.history.push({
    content: this.content,
    title: this.title,
    editedAt: new Date(),
    editedBy: this.metadata.lastEditedBy
  });
};

// Instance method to get public note (without sensitive data)
noteSchema.methods.getPublicNote = function() {
  const noteObject = this.toObject();
  delete noteObject.history;
  delete noteObject.metadata.lastEditedBy;
  return noteObject;
};

// Static method to get user's notes with pagination
noteSchema.statics.getUserNotes = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'updatedAt',
    sortOrder = 'desc',
    category = null,
    search = null,
    isArchived = false,
    isPinned = null
  } = options;

  const query = { userId, isArchived };
  
  if (category) query.category = category;
  if (isPinned !== null) query.isPinned = isPinned;
  
  if (search) {
    query.$text = { $search: search };
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const [notes, total] = await Promise.all([
    this.find(query)
      .populate('category', 'name color')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);

  return {
    notes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

// Static method to get note statistics
noteSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalNotes: { $sum: 1 },
        totalWords: { $sum: '$metadata.wordCount' },
        totalCharacters: { $sum: '$metadata.characterCount' },
        pinnedNotes: { $sum: { $cond: ['$isPinned', 1, 0] } },
        archivedNotes: { $sum: { $cond: ['$isArchived', 1, 0] } },
        publicNotes: { $sum: { $cond: ['$isPublic', 1, 0] } }
      }
    }
  ]);

  return stats[0] || {
    totalNotes: 0,
    totalWords: 0,
    totalCharacters: 0,
    pinnedNotes: 0,
    archivedNotes: 0,
    publicNotes: 0
  };
};

module.exports = mongoose.model('Note', noteSchema); 