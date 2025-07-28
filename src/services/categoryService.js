// Category service - handles all category-related operations
// This will eventually connect to the backend API

import { 
  getAllCategories as getAllCategoriesLocal, 
  createCategory as createCategoryLocal, 
  deleteCategory as deleteCategoryLocal,
  getCategoryByName as getCategoryByNameLocal
} from '../../js/category.js';

// For now, we'll use the local storage functions
// Later, these will be replaced with API calls

export const getAllCategories = () => {
  return getAllCategoriesLocal();
};

export const getCategoryByName = (name) => {
  return getCategoryByNameLocal(name);
};

export const createCategory = (name, color, icon = '') => {
  return createCategoryLocal(name, color, icon);
};

export const deleteCategory = (id) => {
  return deleteCategoryLocal(id);
};

// Future API integration functions (commented out for now)
/*
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getAllCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getCategoryByName = async (name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error('Failed to fetch category');
    return await response.json();
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
};

export const createCategory = async (name, color, icon = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, color, icon }),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return await response.json();
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete category');
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
*/ 