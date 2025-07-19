// Category module - handles note categorization and organization
// This file will contain functions for managing note categories
import { generateId, getNoteById, getAllNotes, assignCategory, getNotesByCategory } from './note.js';

/**
 * P1 - Create a new category
 * @param {string} name - Category name
 * @param {string} color - Category color (hex code)
 * @param {string} icon - Category icon class name
 * @returns {Object} - Created category object
 */
 function createCategoryObject(name, color = '#007bff', icon = 'fas fa-folder') { 
    return {
        name: name,
        color: color,
        icon: icon,
        id: generateId()
    }
 }

 function createCategory(name, color, icon){
    // Validate the category name first
    const validation = validateCategoryName(name);
    if (!validation.isValid) {
        console.error('Category validation failed:', validation.message);
        throw new Error(validation.message);
    }
    
    const category = createCategoryObject(name,color,icon)
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    categories.push(category);
    localStorage.setItem('categories', JSON.stringify(categories));
  
    console.log('Category created and saved to localStorage:', category);
    return category;
 }

/**
 * P1 - Get all categories
 * @returns {Array} - Array of category objects
 */
 function getAllCategories() {
    let categories = [];
  try {
    categories = JSON.parse(localStorage.getItem('categories') || '[]');
  } catch (e) {
    console.error('Failed to parse categories from localStorage', e);
    categories = [];
  }

  if (!Array.isArray(categories)) {
    console.error('Invalid categories data in localStorage');
    return [];
  }

  return categories;
  }

/**
 * P1 - Get category by ID
 * @param {string} categoryId - Unique identifier for the category
 * @returns {Object|null} - Category object or null if not found
 */
 function getCategoryById(categoryId) {
    const categories = getAllCategories()
    return categories.find(function(category){
        return category.id === categoryId;
    }) || null;
  }

/**
 * P1 - Get category by name
 * @param {string} name - Category name
 * @returns {Object|null} - Category object or null if not found
 */
 function getCategoryByName(name) {
    const categories = getAllCategories()
    return categories.find(function(category){
        return category.name === name;
    }) || null;
 }

/**
 * P1 - Update category details
 * @param {string} categoryId - Unique identifier for the category
 * @param {Object} updates - Object with updated properties
 * @returns {boolean} - Success status
 */
 function updateCategory(categoryId, updates) {
    const categories = getAllCategories();
    const index = categories.findIndex(category => category.id === categoryId);
    if (index === -1) {
        console.log("This category does not exist");
        return false;
    }
    // If name is being updated, validate it
    if (updates.hasOwnProperty('name') && updates.name !== categories[index].name) {
        const validation = validateCategoryName(updates.name);
        if (!validation.isValid) {
            console.error('Category name validation failed:', validation.message);
            return false;
        }
    }
    // Update the category properties
    if (updates.hasOwnProperty('name')) categories[index].name = updates.name;
    if (updates.hasOwnProperty('color')) categories[index].color = updates.color;
    if (updates.hasOwnProperty('icon')) categories[index].icon = updates.icon;

    localStorage.setItem('categories', JSON.stringify(categories));
    console.log("Category updated successfully");
    return true;
}
   

/**
 * P1 - Delete a category
 * @param {string} categoryId - Unique identifier for the category
 * @returns {boolean} - Success status
 */
 function deleteCategory(categoryId) {
    const categories = getAllCategories()
    const category = getCategoryById(categoryId)
    if(category === null){
        console.log("This category does not exist")
        return false
    } else{
        const updatedCategories = categories.filter(cat => cat.id !== categoryId);
        localStorage.setItem('categories', JSON.stringify(updatedCategories));
        console.log("Category deleted successfully");
        return true;
    }
}

/**
 * P1 - Remove category from a note
 * @param {string} noteId - Unique identifier for the note
 * @returns {boolean} - Success status
 */
 function removeCategoryFromNote(noteId) {
    const notes = getAllNotes()
    const note = getNoteById(noteId)
    if(note === null){
        console.log("This note does not exist")
        return false
    } else{
        note.category = ""
        return true
    }
    
  }

/**
 * P1 - Get category statistics (note count, etc.)
 * @param {string} categoryId - Unique identifier for the category
 * @returns {Object} - Statistics object
 */
 function getCategoryStats(categoryId) { 
    let sum = 0
    const categories = getAllCategories()
    const category = getCategoryById(categoryId)
    if (!category) {
        return { sum: 0 };
    }
    const notes = getNotesByCategory(category.name);
    for(let i = 0; i < notes.length; i++){
        sum++
    }
    return {
        sum: sum
    }
 }

/**
 * P1 - Get all category statistics
 * @returns {Array} - Array of category statistics objects
 */
 function getAllCategoryStats() {
    const categories = getAllCategories()
    const stats = []
    for(let i = 0; i < categories.length; i++){
        const category = categories[i]
        const categoryStats = getCategoryStats(category.id)
        stats.push(categoryStats)
    }
    return stats
  }

/**
 * P1 - Filter notes by multiple categories
 * @param {Array} categoryIds - Array of category IDs
 * @returns {Array} - Array of notes matching any of the categories
 */
 function filterNotesByCategories(categoryIds) {
    const notes = getAllNotes()
    const filteredNotes = []
    for(let i = 0; i < notes.length; i++){
        const note = notes[i]
        if(categoryIds.includes(note.category)){
            filteredNotes.push(note)
        }
    }
    return filteredNotes;
}

/**
 * P1 - Get uncategorized notes
 * @returns {Array} - Array of notes without categories
 */
 function getUncategorizedNotes() { 
    const notes = getAllNotes()
    const uncategorizedNotes = []
    for(let i = 0; i < notes.length; i++){
        const note = notes[i]
        if(note.category === ""){
            uncategorizedNotes.push(note)
        }
    }
    return uncategorizedNotes
 }

/**
 * P1 - Bulk assign category to multiple notes
 * @param {Array} noteIds - Array of note IDs
 * @param {string} categoryId - Unique identifier for the category
 * @returns {boolean} - Success status
 */
 function bulkAssignCategory(noteIds, categoryId) { 
    for(let i = 0; i < noteIds.length; i++){
        const noteId = noteIds[i]
        const note = getNoteById(noteId)
        if(note === null){
            console.log("This note does not exist")
        }else if(note.category === categoryId){
            console.log("This note already has this category")
        }else{
            note.category = categoryId
        }
    }
 }

/**
 * P1 - Bulk remove category from multiple notes
 * @param {Array} noteIds - Array of note IDs
 * @returns {boolean} - Success status
 */
function bulkRemoveCategory(noteIds) {
    let success = false;

    for (let i = 0; i < noteIds.length; i++) {
        const noteId = noteIds[i];
        const note = getNoteById(noteId);

        if (note === null) {
            console.log("This note does not exist");
        } else {
            note.category = "";
            success = true;
        }
    }

    return success;
}

/**
 * P1 - Validate category name
 * @param {string} name - Category name to validate
 * @returns {Object} - Validation result with status and message
 */
 function validateCategoryName(name) {
    // Check if name is provided and not empty
    if (!name || typeof name !== 'string') {
        return {
            isValid: false,
            message: 'Category name is required and must be a string'
        };
    }
    
    const trimmedName = name.trim();
    
    // Check if name is empty after trimming
    if (trimmedName.length === 0) {
        return {
            isValid: false,
            message: 'Category name cannot be empty'
        };
    }
    
    // Check minimum length
    if (trimmedName.length < 2) {
        return {
            isValid: false,
            message: 'Category name must be at least 2 characters long'
        };
    }
    
    // Check maximum length
    if (trimmedName.length > 50) {
        return {
            isValid: false,
            message: 'Category name cannot exceed 50 characters'
        };
    }
    
    // Check for profanity
    const profaneWords = ['shit', 'fuck', 'ass', 'bitch', 'damn'];
    const hasProfanity = profaneWords.some(word => 
        trimmedName.toLowerCase().includes(word)
    );
    if (hasProfanity) {
        return {
            isValid: false,
            message: 'Category name contains inappropriate language'
        };
    }
    
    // Check if name already exists (case-insensitive)
    const categories = getAllCategories();
    const existingCategory = categories.find(category => 
        category.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingCategory) {
        return {
            isValid: false,
            message: 'A category with this name already exists'
        };
    }
    
    // Check for valid characters (letters, numbers, spaces, hyphens, underscores)
    const validNameRegex = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validNameRegex.test(trimmedName)) {
        return {
            isValid: false,
            message: 'Category name can only contain letters, numbers, spaces, hyphens, and underscores'
        };
    }
    
    return {
        isValid: true,
        message: 'Category name is valid'
    };
}

/**
 * P1 - Check if category name already exists
 * @param {string} name - Category name to check
 * @returns {boolean} - Whether name already exists
 */
 function categoryNameExists(name) {
    if (!name || typeof name !== 'string') {
        return false;
    }
    
    const trimmedName = name.trim().toLowerCase();
    const categories = getAllCategories();
    
    return categories.some(category => 
        category.name.toLowerCase() === trimmedName
    );
}



/**
 * Utility - Get category color by name
 * @param {string} name - Category name
 * @returns {string} - Hex color code
 */
 function getCategoryColor(name) {
    const categories = getAllCategories()
    for(let i = 0; i < categories.length; i++){
        const category = categories[i]
        if(category.name === name){
            return category.color
        }
    }
    return null
  }

/**
 * Utility - Get category icon by name
 * @param {string} name - Category name
 * @returns {string} - Icon class name
 */
 function getCategoryIcon(name) {
    const categories = getAllCategories()
    for(let i = 0; i < categories.length; i++){
        const category = categories[i]
        if(category.name === name){
            return category.icon
        }
    }
    return null
 }

/**
 * Utility - Format category name for display
 * @param {string} name - Raw category name
 * @returns {string} - Formatted category name
 */
 function formatCategoryName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
 }

// Export all implemented functions
export {
    createCategoryObject,
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategoryByName,
    updateCategory,
    deleteCategory,
    validateCategoryName,
    categoryNameExists,
    removeCategoryFromNote,
    getCategoryStats,
    getAllCategoryStats,
    filterNotesByCategories,
    getUncategorizedNotes,
    bulkAssignCategory,
    bulkRemoveCategory,

    getCategoryColor,
    getCategoryIcon,
    formatCategoryName
};