const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/auth');
const { validate } = require('../utils/validation');

// Import user controller (we'll create this next)
const userController = require('../controllers/userController');

// All routes require authentication
router.use(auth);

// GET /api/users - Get all users (admin only)
router.get('/', requireAdmin, userController.getAllUsers);

// GET /api/users/:id - Get user by ID (admin only)
router.get('/:id', requireAdmin, validate('getUser'), userController.getUserById);

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', requireAdmin, validate('updateUser'), userController.updateUser);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', requireAdmin, validate('getUser'), userController.deleteUser);

// GET /api/users/stats - Get user statistics (admin only)
router.get('/stats/overview', requireAdmin, userController.getUserStats);

// POST /api/users/:id/activate - Activate user (admin only)
router.post('/:id/activate', requireAdmin, validate('getUser'), userController.activateUser);

// POST /api/users/:id/deactivate - Deactivate user (admin only)
router.post('/:id/deactivate', requireAdmin, validate('getUser'), userController.deactivateUser);

module.exports = router; 