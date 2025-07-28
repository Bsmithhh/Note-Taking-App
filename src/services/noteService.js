// Note service - handles all note-related operations
// This will eventually connect to the backend API

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

// For now, we'll use the local storage functions
// Later, these will be replaced with API calls

export const getAllNotes = () => {
  return getAllNotesLocal();
};

export const getNoteById = (id) => {
  return getNoteByIdLocal(id);
};

export const createNote = (title, content, category = '') => {
  return createNoteLocal(title, content, category);
};

export const editNote = (id, title, content, category = '') => {
  return editNoteLocal(id, title, content, category);
};

export const deleteNote = (id) => {
  return deleteNoteLocal(id);
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

// Future API integration functions (commented out for now)
// These will be uncommented when we're ready to switch to the backend API
/*
const API_BASE_URL = getApiBaseUrl();

export const getAllNotesAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`);
    if (!response.ok) throw new Error('Failed to fetch notes');
    return await response.json();
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
};

export const getNoteByIdAPI = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`);
    if (!response.ok) throw new Error('Failed to fetch note');
    return await response.json();
  } catch (error) {
    console.error('Error fetching note:', error);
    return null;
  }
};

export const createNoteAPI = async (title, content, category = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, category }),
    });
    if (!response.ok) throw new Error('Failed to create note');
    return await response.json();
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

export const editNoteAPI = async (id, noteData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    if (!response.ok) throw new Error('Failed to update note');
    return await response.json();
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

export const deleteNoteAPI = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete note');
    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};
*/ 