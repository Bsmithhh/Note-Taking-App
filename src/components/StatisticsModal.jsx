import React from 'react';
import Modal from './Modal';
import './CreateNoteModal.css';

const StatisticsModal = ({ isOpen, onClose, notes, categories }) => {
  const calculateStats = () => {
    const totalNotes = notes.length;
    const totalCategories = categories.length;
    
    // Word count
    const totalWords = notes.reduce((sum, note) => {
      return sum + (note.content ? note.content.split(/\s+/).length : 0);
    }, 0);
    
    // Average words per note
    const avgWordsPerNote = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;
    
    // Notes by category
    const notesByCategory = {};
    notes.forEach(note => {
      const category = note.category || 'Uncategorized';
      notesByCategory[category] = (notesByCategory[category] || 0) + 1;
    });
    
    // Most used category
    const mostUsedCategory = Object.entries(notesByCategory)
      .sort(([,a], [,b]) => b - a)[0];
    
    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentNotes = notes.filter(note => 
      new Date(note.timestamp || note.lastModified) > weekAgo
    );
    
    // Longest and shortest notes
    const sortedByLength = [...notes].sort((a, b) => 
      (b.content?.length || 0) - (a.content?.length || 0)
    );
    const longestNote = sortedByLength[0];
    const shortestNote = sortedByLength[sortedByLength.length - 1];
    
    return {
      totalNotes,
      totalCategories,
      totalWords,
      avgWordsPerNote,
      notesByCategory,
      mostUsedCategory,
      recentNotes: recentNotes.length,
      longestNote,
      shortestNote
    };
  };

  const stats = calculateStats();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h3>Note Statistics</h3>
        <button className="close-modal" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">
        <div className="stats-container">
          {/* Overview Stats */}
          <div className="stats-section">
            <h4>Overview</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{stats.totalNotes}</div>
                <div className="stat-label">Total Notes</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.totalCategories}</div>
                <div className="stat-label">Categories</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.totalWords.toLocaleString()}</div>
                <div className="stat-label">Total Words</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.avgWordsPerNote}</div>
                <div className="stat-label">Avg Words/Note</div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="stats-section">
            <h4>Notes by Category</h4>
            <div className="category-stats">
              {Object.entries(stats.notesByCategory).map(([category, count]) => (
                <div key={category} className="category-stat">
                  <div className="category-name">{category}</div>
                  <div className="category-count">{count} notes</div>
                  <div className="category-percentage">
                    {Math.round((count / stats.totalNotes) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="stats-section">
            <h4>Recent Activity</h4>
            <div className="activity-stats">
              <div className="stat-item">
                <div className="stat-number">{stats.recentNotes}</div>
                <div className="stat-label">Notes in Last 7 Days</div>
              </div>
            </div>
          </div>

          {/* Notable Notes */}
          <div className="stats-section">
            <h4>Notable Notes</h4>
            <div className="notable-notes">
              {stats.longestNote && (
                <div className="notable-note">
                  <div className="notable-label">Longest Note:</div>
                  <div className="notable-title">{stats.longestNote.title}</div>
                  <div className="notable-detail">
                    {stats.longestNote.content?.length || 0} characters
                  </div>
                </div>
              )}
              {stats.shortestNote && stats.shortestNote !== stats.longestNote && (
                <div className="notable-note">
                  <div className="notable-label">Shortest Note:</div>
                  <div className="notable-title">{stats.shortestNote.title}</div>
                  <div className="notable-detail">
                    {stats.shortestNote.content?.length || 0} characters
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default StatisticsModal; 