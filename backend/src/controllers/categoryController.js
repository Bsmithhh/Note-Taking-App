const Category = require('../models/Category');
const Note = require('../models/Note');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    // Simple query without complex stats for now
    const categories = await Category.find({ 
      userId: req.user._id, 
      isActive: true 
    })
    .populate('parentCategory', 'name color')
    .sort({ order: 1, name: 1 })
    .lean();

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('parentCategory', 'name color');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get notes in this category
    const notes = await Note.find({
      userId: req.user._id,
      category: category._id,
      isArchived: false
    }).select('title content updatedAt isPinned');

    res.json({
      success: true,
      data: { 
        category,
        notes
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      color,
      icon = '📁',
      parentCategory,
      order
    } = req.body;

    // Check if category name already exists for this user
    const nameExists = await Category.nameExists(req.user._id, name);
    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }

    // Verify parent category belongs to user if provided
    if (parentCategory) {
      const parentExists = await Category.findOne({
        _id: parentCategory,
        userId: req.user._id
      });
      
      if (!parentExists) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    const categoryData = {
      userId: req.user._id,
      name,
      description,
      color,
      icon,
      order: order || 0
    };

    if (parentCategory) {
      categoryData.parentCategory = parentCategory;
    }

    const category = new Category(categoryData);
    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const {
      name,
      description,
      color,
      icon,
      parentCategory,
      order,
      isActive
    } = req.body;

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const nameExists = await Category.nameExists(req.user._id, name, category._id);
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists'
        });
      }
    }

    // Verify parent category belongs to user if provided
    if (parentCategory && parentCategory !== category.parentCategory?.toString()) {
      if (parentCategory === category._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent'
        });
      }

      const parentExists = await Category.findOne({
        _id: parentCategory,
        userId: req.user._id
      });
      
      if (!parentExists) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    // Update fields
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (color !== undefined) category.color = color;
    if (icon !== undefined) category.icon = icon;
    if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has notes
    const noteCount = await Note.countDocuments({
      userId: req.user._id,
      category: category._id
    });

    if (noteCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${noteCount} note(s). Please move or delete the notes first.`
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({
      userId: req.user._id,
      parentCategory: category._id
    });

    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${subcategoryCount} subcategory(ies). Please delete the subcategories first.`
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

// @desc    Get category statistics
// @route   GET /api/categories/stats/overview
// @access  Private
const getCategoryStats = async (req, res) => {
  try {
    const stats = await Category.getUserCategoryStats(req.user._id);
    const totalCategories = await Category.countDocuments({
      userId: req.user._id,
      isActive: true
    });

    const totalNotes = await Note.countDocuments({
      userId: req.user._id,
      isArchived: false
    });

    const uncategorizedNotes = await Note.countDocuments({
      userId: req.user._id,
      category: null,
      isArchived: false
    });

    const mostUsedCategory = stats.length > 0 ? stats[0] : null;
    const leastUsedCategory = stats.length > 0 ? stats[stats.length - 1] : null;

    res.json({
      success: true,
      data: {
        categories: stats,
        totalCategories,
        totalNotes,
        uncategorizedNotes,
        mostUsedCategory,
        leastUsedCategory,
        averageNotesPerCategory: totalCategories > 0 ? Math.round(totalNotes / totalCategories) : 0
      }
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category statistics'
    });
  }
};

// @desc    Reorder categories
// @route   POST /api/categories/reorder
// @access  Private
const reorderCategories = async (req, res) => {
  try {
    const { categoryOrders } = req.body;

    if (!categoryOrders || !Array.isArray(categoryOrders)) {
      return res.status(400).json({
        success: false,
        message: 'Category orders array is required'
      });
    }

    const updatePromises = categoryOrders.map(({ id, order }) => {
      return Category.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        { order },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Categories reordered successfully'
    });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder categories'
    });
  }
};

// @desc    Merge category into another
// @route   POST /api/categories/:id/merge
// @access  Private
const mergeCategory = async (req, res) => {
  try {
    const { targetCategoryId } = req.body;

    if (!targetCategoryId) {
      return res.status(400).json({
        success: false,
        message: 'Target category ID is required'
      });
    }

    const sourceCategory = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    const targetCategory = await Category.findOne({
      _id: targetCategoryId,
      userId: req.user._id
    });

    if (!sourceCategory || !targetCategory) {
      return res.status(404).json({
        success: false,
        message: 'One or both categories not found'
      });
    }

    if (sourceCategory._id.toString() === targetCategory._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot merge category into itself'
      });
    }

    // Move all notes from source category to target category
    const result = await Note.updateMany(
      { userId: req.user._id, category: sourceCategory._id },
      { category: targetCategory._id }
    );

    // Update category note counts
    await Category.findByIdAndUpdate(targetCategory._id, {
      $inc: { 'metadata.noteCount': result.modifiedCount },
      'metadata.lastUsed': new Date()
    });

    // Delete the source category
    await sourceCategory.deleteOne();

    res.json({
      success: true,
      message: `Category "${sourceCategory.name}" merged into "${targetCategory.name}" successfully`,
      data: {
        notesMoved: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Merge category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to merge categories'
    });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  reorderCategories,
  mergeCategory
}; 