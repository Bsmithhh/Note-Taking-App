const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Category = require('../models/Category');
const Note = require('../models/Note');

// GET /api/categories - Get all categories for user
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.getCategoriesWithCounts(req.user._id);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/categories/:id - Get single category
router.get('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// POST /api/categories - Create new category
router.post('/', auth, async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const category = new Category({
      name,
      color: color || '#007bff',
      icon: icon || '📁',
      userId: req.user._id
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('Category name already exists')) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/categories/:id - Update category
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    if (name !== undefined) category.name = name;
    if (color !== undefined) category.color = color;
    if (icon !== undefined) category.icon = icon;
    
    await category.save();
    res.json(category);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('Category name already exists')) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Remove category from all notes that use it
    await Note.updateMany(
      { userId: req.user._id, category: category.name },
      { category: '' }
    );
    
    await category.remove();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// GET /api/categories/stats/usage - Get category usage statistics
router.get('/stats/usage', auth, async (req, res) => {
  try {
    const categories = await Category.getCategoriesWithCounts(req.user._id);
    const totalNotes = await Note.countDocuments({ userId: req.user._id });
    
    const categoryStats = categories.map(cat => ({
      ...cat,
      percentage: totalNotes > 0 ? Math.round((cat.noteCount / totalNotes) * 100) : 0
    }));
    
    const mostUsed = categoryStats.length > 0 ? 
      categoryStats.reduce((max, cat) => cat.noteCount > max.noteCount ? cat : max) : null;
    
    const leastUsed = categoryStats.length > 0 ? 
      categoryStats.reduce((min, cat) => cat.noteCount < min.noteCount ? cat : min) : null;
    
    res.json({
      categories: categoryStats,
      totalCategories: categories.length,
      totalNotes,
      mostUsed,
      leastUsed,
      averageNotesPerCategory: categories.length > 0 ? Math.round(totalNotes / categories.length) : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category statistics' });
  }
});

// POST /api/categories/:id/merge - Merge category into another
router.post('/:id/merge', auth, async (req, res) => {
  try {
    const { targetCategoryId } = req.body;
    
    if (!targetCategoryId) {
      return res.status(400).json({ error: 'Target category ID is required' });
    }
    
    const sourceCategory = await Category.findOne({ _id: req.params.id, userId: req.user._id });
    const targetCategory = await Category.findOne({ _id: targetCategoryId, userId: req.user._id });
    
    if (!sourceCategory || !targetCategory) {
      return res.status(404).json({ error: 'One or both categories not found' });
    }
    
    // Update all notes from source category to target category
    const result = await Note.updateMany(
      { userId: req.user._id, category: sourceCategory.name },
      { category: targetCategory.name }
    );
    
    // Delete the source category
    await sourceCategory.remove();
    
    // Update note counts
    await targetCategory.updateNoteCount();
    
    res.json({ 
      message: 'Categories merged successfully',
      notesMoved: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to merge categories' });
  }
});

module.exports = router; 