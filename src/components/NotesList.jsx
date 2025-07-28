import React from 'react';
import './NotesList.css';

const NotesList = ({ notes, currentNote, onNoteSelect, onNoteDelete, isSearching }) => {
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMinutes = Math.floor((now - then) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const formatNoteContent = (content) => {
    if (!content) return '';
    
    // Strip HTML tags for preview
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;
  };

  const getNoteThumbnail = (content) => {
    if (!content) return '';
    
    // Extract first few words from content
    const textContent = content.replace(/<[^>]*>/g, '');
    const words = textContent.split(' ').slice(0, 10);
    return words.join(' ');
  };

  const displayNotes = isSearching ? notes : notes;

  if (displayNotes.length === 0) {
    return (
      <div className="notes-list">
        <div className="empty-notes">
          <h3>No notes yet</h3>
          <p>Create your first note to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-list">
      {isSearching && (
        <div className="search-results-header">
          Found {displayNotes.length} note{displayNotes.length !== 1 ? 's' : ''}
        </div>
      )}
      
      <div className="notes-container">
        {displayNotes.map(note => (
          <div
            key={note.id}
            className={`note-item ${currentNote?.id === note.id ? 'active' : ''}`}
            onClick={() => onNoteSelect(note.id)}
          >
            <div className="note-item-header">
              <h3 className="note-title">{note.title || 'Untitled'}</h3>
              <div className="note-actions">
                <button
                  className="note-action-btn delete-note-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNoteDelete(note.id);
                  }}
                  title="Delete note"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="note-meta">
              <span className="note-date">
                {getTimeAgo(note.lastModified || note.timestamp)}
              </span>
              {note.category && (
                <span className="note-category">
                  {note.category}
                </span>
              )}
              {note.score && (
                <span className="relevance-score">
                  {Math.round(note.score * 2)} matches
                </span>
              )}
            </div>
            
            <div className="note-preview">
              {formatNoteContent(note.content)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList; 