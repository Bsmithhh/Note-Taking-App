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
import { getAllNotes, createNote, editNote, deleteNote, importNotes } from '../services/noteService';
import { getAllCategories, createCategory, deleteCategory } from '../services/categoryService';
import { fullTextSearch } from '../services/searchService';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [modals, setModals] = useState({
    export: false,
    import: false,
    backup: false,
    statistics: false,
    createNote: false,
    createCategory: false,
    deleteCategory: false
  });
  const [deleteCategoryData, setDeleteCategoryData] = useState(null);

  // Load initial data
  useEffect(() => {
    loadNotes();
    loadCategories();
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
      const results = fullTextSearch(query);
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
    createCategory(categoryData.name, categoryData.color, categoryData.icon);
    loadCategories();
    closeModal('createCategory');
  };

  const handleCategoryDelete = () => {
    if (deleteCategoryData) {
      deleteCategory(deleteCategoryData.id);
      loadCategories();
      loadNotes(); // Notes might be affected
      closeModal('deleteCategory');
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

  const displayNotes = isSearching ? searchResults : notes;

  return (
    <Router>
      <div className="app">
        <Sidebar 
          categories={categories}
          onCategorySelect={(category) => handleSearch('')}
          onCategoryDelete={showDeleteCategoryModal}
          onCreateCategory={() => openModal('createCategory')}
        />
        
        <div className="main-content">
          <div className="notes-panel">
            <div className="notes-header">
              <SearchBar 
                onSearch={handleSearch}
                searchQuery={searchQuery}
                isSearching={isSearching}
              />
              <div className="notes-actions">
                <button 
                  className="export-btn" 
                  onClick={() => openModal('export')}
                  title="Export Notes"
                >
                  📤
                </button>
                <button 
                  className="import-btn" 
                  onClick={() => openModal('import')}
                  title="Import Notes"
                >
                  📥
                </button>
                <button 
                  className="backup-btn" 
                  onClick={() => openModal('backup')}
                  title="Backup & Restore"
                >
                  💾
                </button>
                <button 
                  className="stats-btn" 
                  onClick={() => openModal('statistics')}
                  title="Statistics"
                >
                  📊
                </button>
                <button 
                  className="new-note-btn"
                  onClick={() => openModal('createNote')}
                >
                  ✏️
                </button>
              </div>
            </div>
            
            <NotesList 
              notes={displayNotes}
              currentNote={currentNote}
              onNoteSelect={handleNoteSelect}
              onNoteDelete={handleNoteDelete}
              isSearching={isSearching}
            />
          </div>
          
          <div className="content-area">
            {currentNote ? (
              <NoteEditor 
                note={currentNote}
                categories={categories}
                onSave={handleNoteSave}
                onDelete={handleNoteDelete}
              />
            ) : (
              <div className="empty-state">
                <h2>Welcome to Bear Notes</h2>
                <p>Select a note from the sidebar or create a new one to get started.</p>
              </div>
            )}
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
      </div>
    </Router>
  );
}

export default App; 