// Note module - handles note constructor and note operations
// This file will contain the Note factory function and note management functions


/**
 * Note Factory Function - Creates a new note object
 * @param {string} title - Note title
 * @param {string} content - Note content
 * @param {string} category - Note category (optional)
 * @param {string} id - Unique identifier (auto-generated if not provided)
 * @returns {Object} - Note object
 */
function createNoteObject(title, content, category = '', id = null) {
  return{
    id: id || generateId(),
    title: title,
    content: content,
    category: category,
    timestamp: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }
}

/**
 * P0 - Create a new note
 * @param {string} title - Note title
 * @param {string} content - Note content
 * @param {string} category - Note category (optional)
 * @returns {Object} - Created note object
 */
function createNote(title, content, category = '') { 
  const note = createNoteObject(title, content, category);
  
  // Get existing notes array
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  notes.push(note);
  localStorage.setItem('notes', JSON.stringify(notes));
  
  console.log('Note created and saved to localStorage:', note);
  return note;
}

/**
 * P0 - Get all notes from localStorage
 * @returns {Array} - Array of all note objects
 */
function getAllNotes() {
  try {
    return JSON.parse(localStorage.getItem('notes') || '[]');
  } catch (error) {
    console.error('Error parsing notes from localStorage:', error);
    return [];
  }
}

/**
 * P0 - Get note by ID
 * @param {string} noteId - Unique identifier for the note
 * @returns {Object|null} - Note object or null if not found
 */
function getNoteById(noteId) {
  const notes = getAllNotes();
  return notes.find(note => note.id === noteId) || null;
}

/**
 * P0 - Edit an existing note
 * @param {string} noteId - Unique identifier for the note
 * @param {string} title - Updated title
 * @param {string} content - Updated content
 * @param {string} category - Updated category (optional)
 * @returns {boolean} - Success status
 */
function editNote(noteId, title, content, category = '') {
  const notes = getAllNotes();
  const noteIndex = notes.findIndex(note => note.id === noteId);
  
  if (noteIndex === -1) {
    console.error('Note not found:', noteId);
    return false;
  }
  
  notes[noteIndex] = {
    ...notes[noteIndex],
    title,
    content,
    category,
    lastModified: new Date().toISOString()
  };
  
  localStorage.setItem('notes', JSON.stringify(notes));
  console.log('Note updated:', notes[noteIndex]);
  return true;
}

/**
 * P0 - Delete a note
 * @param {string} noteId - Unique identifier for the note
 * @returns {boolean} - Success status
 */
function deleteNote(noteId) {
  const notes = getAllNotes();
  const filteredNotes = notes.filter(note => note.id !== noteId);
  
  if (filteredNotes.length === notes.length) {
    console.error('Note not found for deletion:', noteId);
    return false;
  }
  
  localStorage.setItem('notes', JSON.stringify(filteredNotes));
  console.log('Note deleted:', noteId);
  return true;
}

/**
 * P1 - Filter notes by category
 * @param {string} category - Category name to filter by
 * @returns {Array} - Array of notes in the specified category
 */
function getNotesByCategory(category) {
  const notes = getAllNotes();
  return notes.filter(note => note.category === category);
}

/**
 * P1 - Search notes by query
 * @param {string} query - Search term
 * @returns {Array} - Array of matching notes
 */
function searchNotes(query) {
  const notes = getAllNotes();
  return notes.filter(note => note.title.toLowerCase().includes(query.toLowerCase()) || note.content.toLowerCase().includes(query.toLowerCase()));
}

/**
 * P1 - Assign category to a note
 * @param {string} noteId - Unique identifier for the note
 * @param {string} category - Category name
 * @returns {boolean} - Success status
 */
function assignCategory(noteId, category) {
    const notes = getAllNotes()
    const noteIndex = notes.findIndex(function(note){
        return note.id === noteId;
    })
    if(noteIndex == -1){
        console.error('Note not found:', noteId);
        return false;
    }
    notes[noteIndex].category = category;
    notes[noteIndex].lastModified = new Date().toISOString();
    localStorage.setItem('notes', JSON.stringify(notes));
    console.log('Category assigned:', category, 'to note:', noteId);
    return true;
}

/**
 * Utility - Generate unique ID for new notes
 * Algorithm: Timestamp + Random String + Counter
 * @returns {string} - Unique identifier
 */
function generateId() {
  // Method 1: Timestamp + Random (Recommended for most use cases)
  const timestamp = Date.now().toString(36); // Convert to base36 for shorter string
  const random = Math.random().toString(36).substring(2, 8); // 6 random characters
  return `${timestamp}-${random}`;
   
}

/**
 * Utility - Format timestamp for display
 * @param {Date} timestamp - Date object
 * @returns {string} - Formatted date string
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
}

/**
 * Utility - Get relative time (e.g., "2 hours ago")
 * @param {Date} timestamp - Date object
 * @returns {string} - Relative time string
 */
function getRelativeTime(timestamp) {
    const now = new Date();
    const noteDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now - noteDate) / (1000 * 60));
    if(diffInMinutes < 1) return 'Just now';
    if(diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if(diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    if(diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)} days ago`;
    return formatTimestamp(timestamp);
}

/**
 * P2 - Apply rich text formatting to note content
 * @param {string} noteId - Unique identifier for the note
 * @param {string} formatType - Type of formatting (bold, italic, underline, etc.)
 * @param {string} text - Text to format
 * @returns {boolean} - Success status
 */
function applyRichTextFormatting(noteId, formatType, text) {
  // TODO: Implement rich text formatting
}

// Export functions for use in other modules
export {
  createNoteObject,
  createNote,
  getAllNotes,
  getNoteById,
  editNote,
  deleteNote,
  getNotesByCategory,
  searchNotes,
  assignCategory,
  generateId,
  formatTimestamp,
  getRelativeTime,
  applyRichTextFormatting
};