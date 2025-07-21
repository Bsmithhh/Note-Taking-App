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
    notes = notes || [];
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
    notes = notes || [];
    return notes.filter(function(note){
        return note.content.toLowerCase().includes(query.toLowerCase());
    })
  }

/**
 * P1 - Perform advanced search with multiple criteria
 * @param {Object} criteria - Search criteria object
 * @param {string} criteria.query - Text query
 * @param {string} criteria.category - Category filter
 * @param {Date} criteria.dateFrom - Start date
 * @param {Date} criteria.dateTo - End date
 * @param {string} criteria.sortBy - Sort field ('relevance', 'date', 'title')
 * @param {string} criteria.sortOrder - Sort order ('asc', 'desc')
 * @param {Array} notes - Array of notes to search through
 * @returns {Array} - Array of matching notes with relevance scores
 */
function advancedSearch(criteria, notes = null) {
    let results = fullTextSearch(criteria.query, notes);
    if (criteria.category) {
        results = results.filter(note => note.category === criteria.category);
    }
    if (criteria.dateFrom) {
        results = results.filter(note => note.timestamp >= criteria.dateFrom);
    }
    if (criteria.dateTo) {
        results = results.filter(note => note.timestamp <= criteria.dateTo);
    }
    if (criteria.sortBy === 'relevance') {
        results = sortByRelevance(results, criteria.query);
    } else if (criteria.sortBy === 'date') {
        results = sortByDate(results, criteria.sortOrder);
    } else if (criteria.sortBy === 'title') {
        results = sortByTitle(results, criteria.sortOrder);
    }
    return results;
}

/**
 * P1 - Search by date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {Array} notes - Notes to search (optional, defaults to all)
 * @returns {Array} - Notes created within date range
 */
function searchByDateRange(startDate, endDate, notes = null) {
    notes = notes || getAllNotes();
    return notes.filter(function(note){
        return note.timestamp >= startDate && note.timestamp <= endDate;
    })
}

/**
 * P1 - Full-text search with relevance scoring
 * @param {string} query - Search query
 * @param {Array} notes - Notes to search (optional, defaults to all)
 * @returns {Array} - Notes with relevance scores
 */
function fullTextSearch(query, notes = null) {
    notes = notes || getAllNotes();
    const results = [];
    notes.forEach(note => {
        const score = calculateRelevanceScore(note, query);
        if (score > 0) {
            results.push({ ...note, score });
        }
    });
    return results.sort((a, b) => b.score - a.score);
}
    

/**
 * P1 - Highlight search terms in search results
 * @param {string} text - Text to highlight
 * @param {string} query - Search query to highlight
 * @returns {string} - HTML string with highlighted terms
 */
function highlightSearchTerms(text, query) {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    let highlightedText = text;
    words.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        highlightedText = highlightedText.replace(regex, match => `<mark>${match}</mark>`);
    });
    return highlightedText;
}

/**
 * P1 - Sort search results by relevance
 * @param {Array} results - Array of search results
 * @param {string} query - Original search query
 * @returns {Array} - Sorted array of results
 */
function sortByRelevance(results, query) { 
    // Results already have relevance scores from fullTextSearch
    // Just return them sorted by score (they should already be sorted)
    return results;
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
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        if (order === 'asc') {
            return titleA.localeCompare(titleB);
        } else {
            return titleB.localeCompare(titleA);
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
 * P1 - Save search query to history
 * @param {string} query - Search query
 * @param {Object} criteria - Search criteria
 * @returns {boolean} - Success status
 */
function saveSearchHistory(query, criteria = {}) {
    let searchHistory = getSearchHistory(10);
    
    // Don't save if it's the same as the most recent search
    if (searchHistory.length > 0 && searchHistory[0].query === query) {
        return true;
    }
    
    searchHistory.unshift({ query, criteria, timestamp: new Date().toISOString() });
    
    // Keep only the last 10 searches
    searchHistory = searchHistory.slice(0, 10);
    
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    return true;
}

/**
 * P1 - Get recent search queries
 * @param {number} limit - Number of recent searches to return
 * @returns {Array} - Array of recent search objects
 */
function getSearchHistory(limit = 10) {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    return searchHistory.slice(0, limit);
}

/**
 * P1 - Clear search history
 * @returns {boolean} - Success status
 */
function clearSearchHistory() {
    localStorage.setItem('searchHistory', JSON.stringify([]));
    return true;
}

/**
 * P1 - Save a search as a named search
 * @param {string} name - Search name
 * @param {Object} criteria - Search criteria
 * @returns {boolean} - Success status
 */
function saveSearch(name, criteria) {
    let savedSearches = getSavedSearches();
    savedSearches.push({ name, criteria, timestamp: new Date().toISOString() });
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
    return true;
}

/**
 * P1 - Get all saved searches
 * @returns {Array} - Array of saved search objects
 */
function getSavedSearches() {
    let savedSearches = JSON.parse(localStorage.getItem('savedSearches')) || [];
    return savedSearches;
}

/**
 * P1 - Delete a saved search
 * @param {string} name - Search name
 * @returns {boolean} - Success status
 */
function deleteSavedSearch(name) {
    let savedSearches = getSavedSearches();
    savedSearches = savedSearches.filter(search => search.name !== name);
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
    return true;
}

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
  advancedSearch,
  searchByDateRange,
  fullTextSearch,
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  saveSearch,
  getSavedSearches,
  deleteSavedSearch,
  highlightSearchTerms,
  sortByDate,
  sortByTitle,
  getSearchSuggestions,
  textMatchesQuery,
  calculateRelevanceScore
};