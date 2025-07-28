const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  color: {
    type: String,
    required: [true, 'Category color is required'],
    default: '#8b7355',
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },
  icon: {
    type: String,
    default: '📁',
    maxlength: [10, 'Icon cannot exceed 10 characters']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  metadata: {
    noteCount: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

// Virtual for full path
categorySchema.virtual('fullPath').get(function() {
  return this.parentCategory ? `${this.parentCategory.name} > ${this.name}` : this.name;
});

// Indexes for better query performance
categorySchema.index({ userId: 1, name: 1 });
categorySchema.index({ userId: 1, isActive: 1 });
categorySchema.index({ userId: 1, parentCategory: 1 });
categorySchema.index({ userId: 1, order: 1 });

// Compound unique index for userId and name
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

// Pre-save middleware to update lastUsed
categorySchema.pre('save', function(next) {
  if (this.isNew) {
    this.metadata.lastUsed = new Date();
  }
  next();
});

// Instance method to get category with stats
categorySchema.methods.getWithStats = async function() {
  const Note = mongoose.model('Note');
  const noteCount = await Note.countDocuments({ 
    userId: this.userId, 
    category: this._id,
    isArchived: false 
  });
  
  this.metadata.noteCount = noteCount;
  return this;
};

// Instance method to update note count
categorySchema.methods.updateNoteCount = async function() {
  const Note = mongoose.model('Note');
  const count = await Note.countDocuments({ 
    userId: this.userId, 
    category: this._id,
    isArchived: false 
  });
  
  this.metadata.noteCount = count;
  this.metadata.lastUsed = new Date();
  return this.save();
};

// Static method to get user's categories with stats
categorySchema.statics.getUserCategories = async function(userId, includeStats = true) {
  try {
    // Ensure userId is a valid ObjectId
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? mongoose.Types.ObjectId(userId) 
      : userId;

    const categories = await this.find({ 
      userId: userObjectId, 
      isActive: true 
    })
    .populate('parentCategory', 'name color')
    .sort({ order: 1, name: 1 })
    .lean();

    if (includeStats) {
      const Note = mongoose.model('Note');
      const noteCounts = await Note.aggregate([
        { $match: { userId: userObjectId, isArchived: false } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);

      const countMap = {};
      noteCounts.forEach(item => {
        if (item._id) {
          countMap[item._id.toString()] = item.count;
        }
      });

      categories.forEach(category => {
        category.metadata.noteCount = countMap[category._id.toString()] || 0;
      });
    }

    return categories;
  } catch (error) {
    console.error('Error in getUserCategories:', error);
    throw error;
  }
};

// Static method to create default categories for new user
categorySchema.statics.createDefaultCategories = async function(userId) {
  const defaultCategories = [
    {
      name: 'Personal',
      description: 'Personal notes and thoughts',
      color: '#FF6B6B',
      icon: '👤',
      order: 1,
      isDefault: true
    },
    {
      name: 'Work',
      description: 'Work-related notes and tasks',
      color: '#4ECDC4',
      icon: '💼',
      order: 2,
      isDefault: true
    },
    {
      name: 'Study',
      description: 'Educational notes and research',
      color: '#45B7D1',
      icon: '📚',
      order: 3,
      isDefault: true
    },
    {
      name: 'Ideas',
      description: 'Creative ideas and inspiration',
      color: '#96CEB4',
      icon: '💡',
      order: 4,
      isDefault: true
    },
    {
      name: 'Archive',
      description: 'Archived and old notes',
      color: '#FFEAA7',
      icon: '📦',
      order: 5,
      isDefault: true
    }
  ];

  const categories = defaultCategories.map(cat => ({
    ...cat,
    userId
  }));

  return this.insertMany(categories);
};

// Static method to get category statistics
categorySchema.statics.getUserCategoryStats = async function(userId) {
  try {
    // Ensure userId is a valid ObjectId
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? mongoose.Types.ObjectId(userId) 
      : userId;

    const stats = await this.aggregate([
      { $match: { userId: userObjectId, isActive: true } },
      {
        $lookup: {
          from: 'notes',
          localField: '_id',
          foreignField: 'category',
          as: 'notes'
        }
      },
      {
        $project: {
          name: 1,
          color: 1,
          noteCount: { $size: '$notes' },
          lastUsed: { $max: '$notes.updatedAt' }
        }
      },
      { $sort: { noteCount: -1 } }
    ]);

    return stats;
  } catch (error) {
    console.error('Error in getUserCategoryStats:', error);
    throw error;
  }
};

// Static method to check if category name exists for user
categorySchema.statics.nameExists = async function(userId, name, excludeId = null) {
  const query = { userId, name: { $regex: new RegExp(`^${name}$`, 'i') } };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const category = await this.findOne(query);
  return !!category;
};

module.exports = mongoose.model('Category', categorySchema); 