// Note service - handles all note-related operations
// This connects to the backend API

import { 
  getAllNotes as getAllNotesLocal, 
  createNote as createNoteLocal, 
  editNote as editNoteLocal, 
  deleteNote as deleteNoteLocal,
  getNoteById as getNoteByIdLocal
} from '../../js/note.js';

import {
  mergeImportedNotes,
  validateImportData
} from '../../js/export.js';

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

// API integration functions
export const getAllNotes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`);
    if (!response.ok) {
      console.warn('API call failed, falling back to localStorage');
      return getAllNotesLocal();
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching notes from API:', error);
    console.log('Falling back to localStorage');
    return getAllNotesLocal();
  }
};

export const getNoteById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`);
    if (!response.ok) {
      console.warn('API call failed, falling back to localStorage');
      return getNoteByIdLocal(id);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching note from API:', error);
    console.log('Falling back to localStorage');
    return getNoteByIdLocal(id);
  }
};

export const createNote = async (title, content, category = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, category }),
    });
    if (!response.ok) {
      console.warn('API call failed, falling back to localStorage');
      return createNoteLocal(title, content, category);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating note via API:', error);
    console.log('Falling back to localStorage');
    return createNoteLocal(title, content, category);
  }
};

export const editNote = async (id, title, content, category = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, category }),
    });
    if (!response.ok) {
      console.warn('API call failed, falling back to localStorage');
      return editNoteLocal(id, title, content, category);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating note via API:', error);
    console.log('Falling back to localStorage');
    return editNoteLocal(id, title, content, category);
  }
};

export const deleteNote = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      console.warn('API call failed, falling back to localStorage');
      return deleteNoteLocal(id);
    }
    return true;
  } catch (error) {
    console.error('Error deleting note via API:', error);
    console.log('Falling back to localStorage');
    return deleteNoteLocal(id);
  }
};

// Import functions
export const importNotes = (importedNotes, options = {}) => {
  try {
    // Validate the imported data
    const validation = validateImportData(importedNotes);
    if (!validation.valid) {
      throw new Error(validation.message);
    }
    
    // Normalize the imported notes (add missing required fields)
    const normalizedNotes = importedNotes.map(note => ({
      id: note.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: note.title,
      content: note.content,
      category: note.category || '',
      timestamp: note.timestamp || new Date().toISOString(),
      lastModified: note.lastModified || new Date().toISOString()
    }));
    
    // Merge with existing notes
    const mergedNotes = mergeImportedNotes(normalizedNotes, {
      duplicateStrategy: options.duplicateStrategy || 'rename'
    });
    
    // Save to localStorage
    localStorage.setItem('notes', JSON.stringify(mergedNotes));
    
    return {
      success: true,
      importedCount: normalizedNotes.length,
      totalCount: mergedNotes.length,
      message: `Successfully imported ${normalizedNotes.length} notes`
    };
  } catch (error) {
    console.error('Import failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to import notes'
    };
  }
}; 