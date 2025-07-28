// Category service - handles all category-related operations
// This connects to the backend API

import {
  getAllCategories as getAllCategoriesLocal,
  createCategory as createCategoryLocal,
  deleteCategory as deleteCategoryLocal,
  getCategoryByName as getCategoryByNameLocal
} from '../../js/category.js';

import { getAuthToken } from './authService.js';

// Get API URL from environment variable or use default
const getApiBaseUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // In browser, check for environment variable or use default
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3001/api'
      : 'https://note-taking-app-production-7468.up.railway.app/api'; // Production Railway backend
  }
  // In Node.js environment (build time) - only access process.env if it exists
  if (typeof process !== 'undefined' && process.env) {
    return process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to get headers with authentication
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// API integration functions
export const getAllCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      console.warn('API call failed, falling back to localStorage');
      return getAllCategoriesLocal();
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories from API:', error);
    console.log('Falling back to localStorage');
    return getAllCategoriesLocal();
  }
};

export const getCategoryByName = async (name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${encodeURIComponent(name)}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      console.warn('API call failed, falling back to localStorage');
      return getCategoryByNameLocal(name);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching category from API:', error);
    console.log('Falling back to localStorage');
    return getCategoryByNameLocal(name);
  }
};

export const createCategory = async (name, color = '', icon = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, color, icon }),
    });
    if (!response.ok) {
      console.warn('API call failed, falling back to localStorage');
      return createCategoryLocal(name, color, icon);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating category via API:', error);
    console.log('Falling back to localStorage');
    return createCategoryLocal(name, color, icon);
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      console.warn('API call failed, falling back to localStorage');
      return deleteCategoryLocal(id);
    }
    return true;
  } catch (error) {
    console.error('Error deleting category via API:', error);
    console.log('Falling back to localStorage');
    return deleteCategoryLocal(id);
  }
}; 