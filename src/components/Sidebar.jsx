import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ categories, onCategorySelect, onCategoryDelete, onCreateCategory }) => {
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#007bff', icon: '📁' });

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (newCategory.name.trim()) {
      onCreateCategory(newCategory);
      setNewCategory({ name: '', color: '#007bff', icon: '📁' });
      setIsCreatingCategory(false);
    }
  };

  const getNotesByCategory = (categoryName) => {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    return notes.filter(note => note.category === categoryName);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Categories</h2>
        <button 
          className="sidebar-close-btn"
          onClick={() => document.getElementById('sidebar-toggle').checked = false}
        >
          ✕
        </button>
      </div>
      
      <div className="sidebar-content">
        <div className="category-section">
          {categories.map(category => {
            if (!category || !category.name) return null;
            
            const categoryNotes = getNotesByCategory(category.name);
            return (
              <div 
                key={category.id} 
                className="category-item"
                onClick={() => onCategorySelect(category.name)}
              >
                <span 
                  className="tag-indicator" 
                  style={{ backgroundColor: category.color || '#f0f0f0' }}
                />
                <span>{category.name}</span>
                <span className="count">{categoryNotes.length}</span>
                <button 
                  className="delete-category-btn" 
                  title="Delete category"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCategoryDelete(category.id, category.name);
                  }}
                >
                  🗑️
                </button>
              </div>
            );
          })}
        </div>

        <div className="create-category-container">
          {isCreatingCategory ? (
            <form onSubmit={handleCreateCategory} className="category-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <select
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                >
                  <option value="📁">📁</option>
                  <option value="📝">📝</option>
                  <option value="💼">💼</option>
                  <option value="🎯">🎯</option>
                  <option value="⭐">⭐</option>
                  <option value="🔥">🔥</option>
                  <option value="💡">💡</option>
                  <option value="📚">📚</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Create</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setIsCreatingCategory(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button 
              className="create-category-btn"
              onClick={() => setIsCreatingCategory(true)}
            >
              <span className="category-icon">+</span>
              Create Category
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 