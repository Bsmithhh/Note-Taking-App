// Search module - handles note searching functionality
// This file will contain functions for searching through notes

import { getAllNotes } from './note.js';

/**
 * P1 - Search notes by title only
 * @param {string} query - Search term
 * @param {Array} notes - Array of notes to search through
 * @returns {Array} - Array of matching notes
 */
 function searchNotesByTitle(query, notes) {
    return notes.filter(function(note){
        return note.title.toLowerCase().includes(query.toLowerCase())
    })
  }

/**
 * P1 - Search notes by content only
 * @param {string} query - Search term
 * @param {Array} notes - Array of notes to search through
 * @returns {Array} - Array of matching notes
 */
 function searchNotesByContent(query, notes) {
    return notes.filter(function(note){
        return note.content.toLowerCase().includes(query.toLowerCase())
    })
  }

/**
 * P1 - Perform advanced search with multiple criteria
 * @param {Object} criteria - Search criteria object
 * @param {string} criteria.query - Text query
 * @param {string} criteria.category - Category filter
 * @param {Date} criteria.dateFrom - Start date
 * @param {Date} criteria.dateTo - End date
 * @param {Array} notes - Array of notes to search through
 * @returns {Array} - Array of matching notes
 */
// function advancedSearch(criteria, notes) { }

/**
 * P1 - Highlight search terms in search results
 * @param {string} text - Text to highlight
 * @param {string} query - Search query to highlight
 * @returns {string} - HTML string with highlighted terms
 */
// function highlightSearchTerms(text, query) { }

/**
 * P1 - Sort search results by relevance
 * @param {Array} results - Array of search results
 * @param {string} query - Original search query
 * @returns {Array} - Sorted array of results
 */
function sortByRelevance(results, query) { 
    const notes = getAllNotes();
    let filteredNotes = searchNotes(query, notes);

    filteredNotes.sort(function(a, b) {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    return filteredNotes;
}

/**
 * P1 - Sort search results by date
 * @param {Array} results - Array of search results
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} - Sorted array of results
 */
 function sortByDate(results, order = 'desc') { 
    return results.sort(function(a, b) {
        if (order === 'asc') {
          return new Date(a.timestamp) - new Date(b.timestamp);
        } else {
          return new Date(b.timestamp) - new Date(a.timestamp);
        }
    });
 }

/**
 * P1 - Sort search results by title
 * @param {Array} results - Array of search results
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} - Sorted array of results
 */
 function sortByTitle(results, order = 'asc') { 
    return results.sort(function(a, b) {
        if (order === 'asc') {
            return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
        } else {
            return b.title.toLowerCase().localeCompare(a.title.toLowerCase());
        }
    });
 }

/**
 * P1 - Get search suggestions based on existing notes
 * @param {string} partialQuery - Partial search query
 * @param {Array} notes - Array of notes to search through
 * @returns {Array} - Array of suggestion strings
 */
 function getSearchSuggestions(partialQuery, notes) {
    return notes.filter(function(note){
        return note.title.toLowerCase().includes(partialQuery.toLowerCase())
    })
  }

/**
 * P1 - Clear search results and show all notes
 */
// function clearSearch() { }

/**
 * P1 - Save search query to search history
 * @param {string} query - Search query to save
 */
// function saveSearchHistory(query) { }

/**
 * P1 - Get recent search queries
 * @returns {Array} - Array of recent search queries
 */
// function getSearchHistory() { }

/**
 * P1 - Clear search history
 */
// function clearSearchHistory() { }

/**
 * Utility - Debounce search input to avoid excessive API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
// function debounce(func, delay) { }

/**
 * Utility - Check if text matches search query (case-insensitive)
 * @param {string} text - Text to check
 * @param {string} query - Search query
 * @returns {boolean} - Whether text matches query
 */
 function textMatchesQuery(text, query) { 
    return text.toLowerCase().includes(query.toLowerCase())
 }

/**
 * Utility - Calculate search relevance score
 * @param {Object} note - Note object
 * @param {string} query - Search query
 * @returns {number} - Relevance score (0-1)
 */
 function calculateRelevanceScore(note, query) { 
    let score = 0;
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    // 0.5 if any word in title, 0.5 if any word in content
    if (words.some(word => note.title.toLowerCase().includes(word))) score += 0.5;
    if (words.some(word => note.content.toLowerCase().includes(word))) score += 0.5;
    return score;
 }

export {
  searchNotesByTitle,
  searchNotesByContent,
  sortByDate,
  sortByTitle,
  getSearchSuggestions,
  textMatchesQuery,
  calculateRelevanceScore
};