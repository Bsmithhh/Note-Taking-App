const { body, param, query, validationResult } = require('express-validator');

// Common validation rules
const commonValidations = {
  username: body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  email: body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  firstName: body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  lastName: body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  noteTitle: body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Note title must be between 1 and 200 characters'),
  
  noteContent: body('content')
    .optional()
    .isLength({ max: 50000 })
    .withMessage('Note content cannot exceed 50,000 characters'),
  
  categoryName: body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name must be between 1 and 50 characters'),
  
  categoryColor: body('color')
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color (e.g., #FF6B6B)'),
  
  categoryIcon: body('icon')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Icon cannot exceed 10 characters'),
  
  categoryDescription: body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  
  objectId: param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  search: query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  sortBy: query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'category'])
    .withMessage('Invalid sort field'),
  
  sortOrder: query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"')
};

// Validation chains for different operations
const validationChains = {
  // User registration
  register: [
    commonValidations.username,
    commonValidations.email,
    commonValidations.password,
    commonValidations.firstName,
    commonValidations.lastName
  ],
  
  // User login
  login: [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username or email is required'),
    commonValidations.password
  ],
  
  // Update user profile
  updateProfile: [
    commonValidations.firstName,
    commonValidations.lastName,
    body('avatar')
      .optional()
      .isURL()
      .withMessage('Avatar must be a valid URL'),
    body('preferences.theme')
      .optional()
      .isIn(['light', 'dark', 'auto'])
      .withMessage('Theme must be light, dark, or auto'),
    body('preferences.language')
      .optional()
      .isLength({ min: 2, max: 5 })
      .withMessage('Language code must be between 2 and 5 characters')
  ],
  
  // Change password
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    commonValidations.password,
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      })
  ],
  
  // Create note
  createNote: [
    commonValidations.noteTitle,
    commonValidations.noteContent,
    body('category')
      .optional()
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Each tag must be between 1 and 50 characters'),
    body('isPinned')
      .optional()
      .isBoolean()
      .withMessage('isPinned must be a boolean'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high'),
    body('color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Color must be a valid hex color')
  ],
  
  // Update note
  updateNote: [
    commonValidations.objectId,
    commonValidations.noteTitle,
    commonValidations.noteContent,
    body('category')
      .optional()
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Each tag must be between 1 and 50 characters'),
    body('isPinned')
      .optional()
      .isBoolean()
      .withMessage('isPinned must be a boolean'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean'),
    body('isArchived')
      .optional()
      .isBoolean()
      .withMessage('isArchived must be a boolean'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high'),
    body('color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Color must be a valid hex color')
  ],
  
  // Create category
  createCategory: [
    commonValidations.categoryName,
    commonValidations.categoryColor,
    commonValidations.categoryIcon,
    commonValidations.categoryDescription,
    body('parentCategory')
      .optional()
      .isMongoId()
      .withMessage('Invalid parent category ID'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer')
  ],
  
  // Update category
  updateCategory: [
    commonValidations.objectId,
    commonValidations.categoryName,
    commonValidations.categoryColor,
    commonValidations.categoryIcon,
    commonValidations.categoryDescription,
    body('parentCategory')
      .optional()
      .isMongoId()
      .withMessage('Invalid parent category ID'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
  ],
  
  // Get notes with pagination
  getNotes: [
    commonValidations.page,
    commonValidations.limit,
    commonValidations.search,
    commonValidations.sortBy,
    commonValidations.sortOrder,
    query('category')
      .optional()
      .isMongoId()
      .withMessage('Invalid category ID'),
    query('isArchived')
      .optional()
      .isBoolean()
      .withMessage('isArchived must be a boolean'),
    query('isPinned')
      .optional()
      .isBoolean()
      .withMessage('isPinned must be a boolean'),
    query('tags')
      .optional()
      .isString()
      .withMessage('Tags must be a comma-separated string')
  ],
  
  // Get single note
  getNote: [
    commonValidations.objectId
  ],
  
  // Get single category
  getCategory: [
    commonValidations.objectId
  ]
};

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// Helper function to create validation middleware
const validate = (chainName) => {
  const chain = validationChains[chainName];
  if (!chain) {
    throw new Error(`Validation chain '${chainName}' not found`);
  }
  
  return [...chain, handleValidationErrors];
};

module.exports = {
  validate,
  handleValidationErrors,
  commonValidations
}; 