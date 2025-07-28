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
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  if (notes.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <h3>No notes yet</h3>
        <p className="empty-subtitle">Create your first note to get started!</p>
      </div>
    );
  }

  return (
    <div className="notes-list">
      {notes.map(note => (
        <div
          key={note.id}
          className={`note-item ${currentNote?.id === note.id ? 'active' : ''}`}
          onClick={() => onNoteSelect(note.id)}
        >
          <div className="note-item-header">
            <h3 className="note-title">{note.title || 'Untitled Note'}</h3>
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onNoteDelete(note.id);
              }}
              title="Delete note"
            >
              🗑️
            </button>
          </div>
          
          <p className="note-preview">
            {formatNoteContent(note.content)}
          </p>
          
          <div className="note-meta">
            <span className="note-date">
              {getTimeAgo(note.lastModified)}
            </span>
            {note.category && (
              <span className="note-category">
                {note.category}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotesList; 