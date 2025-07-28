const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters']
  },
  color: {
    type: String,
    default: '#007bff',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  icon: {
    type: String,
    default: '📁',
    maxlength: [2, 'Icon must be 1-2 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  noteCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ userId: 1, name: 1 }, { unique: true });
categorySchema.index({ userId: 1, createdAt: -1 });

// Pre-save middleware to ensure unique names per user
categorySchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const existingCategory = await this.constructor.findOne({
      userId: this.userId,
      name: this.name,
      _id: { $ne: this._id }
    });
    
    if (existingCategory) {
      throw new Error('Category name already exists for this user');
    }
  }
  next();
});

// Static method to get categories with note counts
categorySchema.statics.getCategoriesWithCounts = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'notes',
        localField: 'name',
        foreignField: 'category',
        as: 'notes'
      }
    },
    {
      $addFields: {
        noteCount: { $size: '$notes' }
      }
    },
    {
      $project: {
        notes: 0
      }
    },
    { $sort: { createdAt: -1 } }
  ]);
};

// Instance method to update note count
categorySchema.methods.updateNoteCount = async function() {
  const Note = mongoose.model('Note');
  const count = await Note.countDocuments({
    userId: this.userId,
    category: this.name
  });
  this.noteCount = count;
  return this.save();
};

module.exports = mongoose.model('Category', categorySchema); 