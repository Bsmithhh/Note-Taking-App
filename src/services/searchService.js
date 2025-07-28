// Search service - handles all search-related operations
// This will eventually connect to the backend API

import { 
  fullTextSearch as fullTextSearchLocal,
  getSearchHistory as getSearchHistoryLocal,
  saveSearchHistory as saveSearchHistoryLocal,
  clearSearchHistory as clearSearchHistoryLocal
} from '../../js/search.js';

// For now, we'll use the local storage functions
// Later, these will be replaced with API calls

export const fullTextSearch = (query) => {
  return fullTextSearchLocal(query);
};

export const getSearchHistory = (limit = 10) => {
  return getSearchHistoryLocal(limit);
};

export const saveSearchHistory = (query, criteria = {}) => {
  return saveSearchHistoryLocal(query, criteria);
};

export const clearSearchHistory = () => {
  return clearSearchHistoryLocal();
};

// Future API integration functions (commented out for now)
/*
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const fullTextSearch = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search notes');
    return await response.json();
  } catch (error) {
    console.error('Error searching notes:', error);
    return [];
  }
};

export const getSearchHistory = async (limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/history?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch search history');
    return await response.json();
  } catch (error) {
    console.error('Error fetching search history:', error);
    return [];
  }
};

export const saveSearchHistory = async (query, criteria = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, criteria }),
    });
    if (!response.ok) throw new Error('Failed to save search history');
    return await response.json();
  } catch (error) {
    console.error('Error saving search history:', error);
    throw error;
  }
};

export const clearSearchHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/history`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to clear search history');
    return true;
  } catch (error) {
    console.error('Error clearing search history:', error);
    throw error;
  }
};
*/ 