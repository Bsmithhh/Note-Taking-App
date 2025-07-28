import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';
import SearchBar from './SearchBar';
import ExportModal from './ExportModal';
import ImportModal from './ImportModal';
import BackupModal from './BackupModal';
import StatisticsModal from './StatisticsModal';
import CreateNoteModal from './CreateNoteModal';
import CreateCategoryModal from './CreateCategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import ProfileModal from './ProfileModal';
import { getAllNotes, createNote, editNote, deleteNote, importNotes } from '../services/noteService';
import { getAllCategories, createCategory, deleteCategory } from '../services/categoryService';
import { fullTextSearch } from '../services/searchService';
import { isAuthenticated, getCurrentUser } from '../services/authService';
import './Toolbar.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modals, setModals] = useState({
    export: false,
    import: false,
    backup: false,
    statistics: false,
    createNote: false,
    createCategory: false,
    deleteCategory: false,
    login: false,
    register: false,
    profile: false
  });
  const [deleteCategoryData, setDeleteCategoryData] = useState(null);

  // Check authentication on app load
  useEffect(() => {
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      loadNotes();
      loadCategories();
    }
  }, []);

  const loadNotes = () => {
    const allNotes = getAllNotes();
    setNotes(allNotes);
  };

  const loadCategories = () => {
    const allCategories = getAllCategories();
    setCategories(allCategories);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = fullTextSearch(query, notes);
      setSearchResults(results);
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleNoteSelect = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    setCurrentNote(note);
    // Close sidebar on mobile when note is selected
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const handleNoteSave = (noteData) => {
    if (noteData.id) {
      editNote(noteData.id, noteData);
    } else {
      createNote(noteData.title, noteData.content, noteData.category);
    }
    loadNotes();
    loadCategories();
  };

  const handleNoteDelete = (noteId) => {
    deleteNote(noteId);
    loadNotes();
    if (currentNote && currentNote.id === noteId) {
      setCurrentNote(null);
    }
  };

  const handleCategoryCreate = (categoryData) => {
    createCategory(categoryData.name, categoryData.color);
    loadCategories();
  };

  const handleCategoryDelete = () => {
    if (deleteCategoryData) {
      deleteCategory(deleteCategoryData.id, deleteCategoryData.reassignTo);
      loadNotes();
      loadCategories();
      setDeleteCategoryData(null);
    }
  };

  const openModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const showDeleteCategoryModal = (categoryId, categoryName) => {
    setDeleteCategoryData({ id: categoryId, name: categoryName });
    openModal('deleteCategory');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    loadNotes();
    loadCategories();
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    loadNotes();
    loadCategories();
  };

  const handleLogout = () => {
    setUser(null);
    setNotes([]);
    setCategories([]);
    setCurrentNote(null);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const switchToRegister = () => {
    closeModal('login');
    openModal('register');
  };

  const switchToLogin = () => {
    closeModal('register');
    openModal('login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // If user is not authenticated, show login screen
  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-welcome">
          <h1>Welcome to Bear Notes</h1>
          <p>Your personal note-taking companion</p>
          <div className="auth-buttons">
            <button 
              className="auth-button primary"
              onClick={() => openModal('login')}
            >
              Sign In
            </button>
            <button 
              className="auth-button secondary"
              onClick={() => openModal('register')}
            >
              Create Account
            </button>
          </div>
        </div>

        <LoginModal 
          isOpen={modals.login}
          onClose={() => closeModal('login')}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={switchToRegister}
        />

        <RegisterModal 
          isOpen={modals.register}
          onClose={() => closeModal('register')}
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={switchToLogin}
        />
      </div>
    );
  }

  // Display notes based on search or all notes
  const displayNotes = isSearching ? searchResults : notes;

  return (
    <Router>
      <div className="app">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            ☰
          </button>
          <h1>Bear Notes</h1>
          <button className="mobile-add-btn" onClick={() => openModal('createNote')}>
            +
          </button>
        </div>

        <div className="app-container">
          {/* Sidebar */}
          <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-header">
              <h1 className="app-title">Bear Notes</h1>
              <button 
                className="add-note-btn"
                onClick={() => openModal('createNote')}
                title="Create Note"
              >
                +
              </button>
            </div>

            <div className="search-container">
              <SearchBar onSearch={handleSearch} />
            </div>

            <div className="notes-list">
              <NotesList 
                notes={displayNotes}
                currentNote={currentNote}
                onNoteSelect={handleNoteSelect}
                onNoteDelete={handleNoteDelete}
                isSearching={isSearching}
              />
            </div>
          </div>

          {/* Sidebar Overlay for Mobile */}
          {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

          {/* Main Content Area */}
          <div className="main-content">
            {/* Toolbar */}
            <div className="toolbar">
              <div className="toolbar-left">
                <button 
                  className="toolbar-button"
                  onClick={() => openModal('export')}
                  title="Export Notes"
                >
                  📤 Export
                </button>
                <button 
                  className="toolbar-button"
                  onClick={() => openModal('import')}
                  title="Import Notes"
                >
                  📥 Import
                </button>
                <button 
                  className="toolbar-button"
                  onClick={() => openModal('backup')}
                  title="Backup & Restore"
                >
                  💾 Backup
                </button>
                <button 
                  className="toolbar-button"
                  onClick={() => openModal('statistics')}
                  title="View Statistics"
                >
                  📊 Statistics
                </button>
              </div>
              <div className="toolbar-right">
                <button 
                  className="toolbar-button profile-btn"
                  onClick={() => openModal('profile')}
                  title="User Profile"
                >
                  👤 {user.username}
                </button>
              </div>
            </div>

            {/* Editor Container */}
            <div className="editor-container">
              {currentNote ? (
                <NoteEditor 
                  note={currentNote}
                  categories={categories}
                  onSave={handleNoteSave}
                  onDelete={handleNoteDelete}
                />
              ) : (
                <div className="empty-editor">
                  <div className="empty-editor-icon">📝</div>
                  <h2>Welcome to Bear Notes</h2>
                  <p>Select a note from the sidebar or create a new one to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <ExportModal 
          isOpen={modals.export}
          onClose={() => closeModal('export')}
          notes={notes}
          currentNote={currentNote}
        />
        
        <ImportModal 
          isOpen={modals.import}
          onClose={() => closeModal('import')}
          onImport={(importedNotes) => {
            const result = importNotes(importedNotes, { duplicateStrategy: 'rename' });
            if (result.success) {
              loadNotes();
              loadCategories();
              alert(result.message);
            } else {
              alert(`Import failed: ${result.error}`);
            }
            closeModal('import');
          }}
        />
        
        <BackupModal 
          isOpen={modals.backup}
          onClose={() => closeModal('backup')}
          onRestore={() => {
            loadNotes();
            loadCategories();
            closeModal('backup');
          }}
        />
        
        <StatisticsModal 
          isOpen={modals.statistics}
          onClose={() => closeModal('statistics')}
          notes={notes}
          categories={categories}
        />
        
        <CreateNoteModal 
          isOpen={modals.createNote}
          onClose={() => closeModal('createNote')}
          categories={categories}
          onCreate={(noteData) => {
            createNote(noteData.title, noteData.content, noteData.category);
            loadNotes();
            closeModal('createNote');
          }}
        />
        
        <CreateCategoryModal 
          isOpen={modals.createCategory}
          onClose={() => closeModal('createCategory')}
          onCreate={handleCategoryCreate}
        />
        
        <DeleteCategoryModal 
          isOpen={modals.deleteCategory}
          onClose={() => closeModal('deleteCategory')}
          onConfirm={handleCategoryDelete}
          category={deleteCategoryData}
        />

        <ProfileModal 
          isOpen={modals.profile}
          onClose={() => closeModal('profile')}
          onLogout={handleLogout}
        />
      </div>
    </Router>
  );
}

export default App; 