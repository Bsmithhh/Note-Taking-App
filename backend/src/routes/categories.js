const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validate } = require('../utils/validation');

// Import category controller (we'll create this next)
const categoryController = require('../controllers/categoryController');

// All routes require authentication
router.use(auth);

// GET /api/categories - Get all categories
router.get('/', categoryController.getCategories);

// GET /api/categories/:id - Get single category
router.get('/:id', validate('getCategory'), categoryController.getCategory);

// POST /api/categories - Create new category
router.post('/', validate('createCategory'), categoryController.createCategory);

// PUT /api/categories/:id - Update category
router.put('/:id', validate('updateCategory'), categoryController.updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', validate('getCategory'), categoryController.deleteCategory);

// GET /api/categories/stats - Get category statistics
router.get('/stats/overview', categoryController.getCategoryStats);

// POST /api/categories/reorder - Reorder categories
router.post('/reorder', categoryController.reorderCategories);

// POST /api/categories/:id/merge - Merge category into another
router.post('/:id/merge', validate('getCategory'), categoryController.mergeCategory);

module.exports = router; 