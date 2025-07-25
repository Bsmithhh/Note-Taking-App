// Main application controller
import '../styles.css';
import { 
    createNote, 
    getAllNotes, 
    getNoteById, 
    editNote, 
    deleteNote, 
    getNotesByCategory,
    searchNotes,
    getRelativeTime,
    formatTimestamp
} from './note.js';

import { 
    createCategory, 
    getAllCategories, 
    getCategoryById,
    getCategoryByName,
    updateCategory, 
    deleteCategory,
    getCategoryStats,
    getCategoryColor
} from './category.js';

import {
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
} from './search.js';

import {
    exportToJson,
    exportToMarkdown,
    exportToPdf,
    exportNote,
    generateExportFilename,
    importFromJson,
    importFromMarkdown,
    validateImportData,
    mergeImportedNotes
} from './export.js';

class BearNotesApp {
    constructor() {
        this.currentNoteId = null;
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.isEditing = false;
        this.categoryToDelete = null;
        
        this.initializeApp();
        this.bindEvents();
        this.initializeExportImport();
        this.loadSampleData();
    }

    initializeApp() {
        this.renderSidebar();
        this.renderNotesList();
        this.renderMainContent();
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            // Real-time search (without saving to history)
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // New note button
        const newNoteBtn = document.querySelector('.new-note-btn');
        if (newNoteBtn) {
            newNoteBtn.addEventListener('click', () => {
                this.createNewNote();
            });
        }

        // Create category button
        const createCategoryBtn = document.querySelector('.create-category-btn');
        if (createCategoryBtn) {
            createCategoryBtn.addEventListener('click', () => {
                this.showCreateCategoryModal();
            });
        }

        // Category modal events
        const categoryModal = document.getElementById('category-modal');
        const categoryForm = document.getElementById('category-form');
        const cancelCategoryBtn = document.getElementById('cancel-category');
        const closeModalBtn = document.querySelector('.close-modal');

        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateCategory();
            });
        }

        if (cancelCategoryBtn) {
            cancelCategoryBtn.addEventListener('click', () => {
                this.hideCreateCategoryModal();
            });
        }

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.hideCreateCategoryModal();
            });
        }

        // Close modal when clicking outside
        if (categoryModal) {
            categoryModal.addEventListener('click', (e) => {
                if (e.target === categoryModal) {
                    this.hideCreateCategoryModal();
                }
            });
        }

        // Note modal events
        const noteModal = document.getElementById('note-modal');
        const noteForm = document.getElementById('note-form');
        const cancelNoteBtn = document.getElementById('cancel-note');
        const closeNoteModalBtn = document.querySelector('#note-modal .close-modal');

        if (noteForm) {
            noteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateNote();
            });
        }

        if (cancelNoteBtn) {
            cancelNoteBtn.addEventListener('click', () => {
                this.hideCreateNoteModal();
            });
        }

        if (closeNoteModalBtn) {
            closeNoteModalBtn.addEventListener('click', () => {
                this.hideCreateNoteModal();
            });
        }

        // Close note modal when clicking outside
        if (noteModal) {
            noteModal.addEventListener('click', (e) => {
                if (e.target === noteModal) {
                    this.hideCreateNoteModal();
                }
            });
        }

        // Delete category modal events
        const deleteCategoryModal = document.getElementById('delete-category-modal');
        const cancelDeleteCategoryBtn = document.getElementById('cancel-delete-category');
        const confirmDeleteCategoryBtn = document.getElementById('confirm-delete-category');
        const closeDeleteCategoryModalBtn = document.querySelector('#delete-category-modal .close-modal');

        if (cancelDeleteCategoryBtn) {
            cancelDeleteCategoryBtn.addEventListener('click', () => {
                this.hideDeleteCategoryModal();
            });
        }

        if (confirmDeleteCategoryBtn) {
            confirmDeleteCategoryBtn.addEventListener('click', () => {
                this.handleDeleteCategory();
            });
        }

        if (closeDeleteCategoryModalBtn) {
            closeDeleteCategoryModalBtn.addEventListener('click', () => {
                this.hideDeleteCategoryModal();
            });
        }

        // Close delete category modal when clicking outside
        if (deleteCategoryModal) {
            deleteCategoryModal.addEventListener('click', (e) => {
                if (e.target === deleteCategoryModal) {
                    this.hideDeleteCategoryModal();
                }
            });
        }

        // Category clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-item')) {
                const categoryItem = e.target.closest('.category-item');
                
                // Handle delete button clicks
                if (e.target.classList.contains('delete-category-btn')) {
                    e.stopPropagation(); // Prevent category selection
                    const categoryId = categoryItem.dataset.categoryId;
                    const categoryName = categoryItem.dataset.category;
                    this.showDeleteCategoryModal(categoryId, categoryName);
                    return;
                }
                
                // Handle regular category clicks
                const categoryName = categoryItem.dataset.category;
                this.filterByCategory(categoryName);
            }
            
            if (e.target.closest('.note-item')) {
                const noteId = e.target.closest('.note-item').dataset.noteId;
                this.selectNote(noteId);
            }
        });

        // Note content editing
        const noteContent = document.querySelector('.note-editor');
        if (noteContent) {
            noteContent.addEventListener('input', () => {
                this.handleNoteEdit();
            });
        }

        // Initialize advanced search functionality
        this.initializeAdvancedSearch();
        
        // Initialize search history functionality
        this.initializeSearchHistory();
    }

    loadSampleData() {
        // No sample data - start with clean interface
        console.log('Starting with clean interface');
    }

    renderSidebar() {
        const categories = getAllCategories();
        const allNotes = getAllNotes();
        
        // Update the tags section with dynamic categories
        const tagsSection = document.querySelector('.tags-section');
        if (tagsSection) {
            // Find or create the dynamic categories container
            let dynamicCategoriesContainer = document.getElementById('dynamic-categories');
            if (!dynamicCategoriesContainer) {
                dynamicCategoriesContainer = document.createElement('div');
                dynamicCategoriesContainer.id = 'dynamic-categories';
                // Insert after the create category button
                const createCategoryContainer = document.querySelector('.create-category-container');
                if (createCategoryContainer) {
                    createCategoryContainer.insertAdjacentElement('afterend', dynamicCategoriesContainer);
                }
            }
            
            // Clear and rebuild dynamic categories
            dynamicCategoriesContainer.innerHTML = '';
            
            categories.forEach(category => {
                const categoryNotes = getNotesByCategory(category.name);
                const categoryItem = document.createElement('div');
                categoryItem.className = 'category-item';
                categoryItem.dataset.category = category.name;
                categoryItem.dataset.categoryId = category.id;
                categoryItem.innerHTML = `
                    <span class="tag-indicator" style="background-color: ${category.color};"></span>
                    <span>${category.name}</span>
                    <span class="count">${categoryNotes.length}</span>
                    <button class="delete-category-btn" title="Delete category">🗑️</button>
                `;
                dynamicCategoriesContainer.appendChild(categoryItem);
            });
        }
        
        // Update category counts
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            const categoryName = item.dataset.category;
            const countElement = item.querySelector('.count');
            
            if (categoryName === 'all') {
                if (countElement) countElement.textContent = allNotes.length;
            } else if (categoryName === 'untagged') {
                const untaggedCount = allNotes.filter(note => !note.category || note.category === '').length;
                if (countElement) countElement.textContent = untaggedCount;
            } else {
                const categoryNotes = getNotesByCategory(categoryName);
                if (countElement) countElement.textContent = categoryNotes.length;
            }
        });

    }

    renderNotesList() {
        const notesList = document.querySelector('.notes-list');
        if (!notesList) return;

        let notes = [];
        
        if (this.searchQuery) {
            // Use full-text search with relevance scoring
            notes = fullTextSearch(this.searchQuery);
        } else if (this.currentCategory === 'all') {
            notes = getAllNotes();
        } else if (this.currentCategory === 'untagged') {
            notes = getAllNotes().filter(note => !note.category || note.category === '');
        } else {
            notes = getNotesByCategory(this.currentCategory);
        }

        // Sort by most recent (unless search results are already sorted by relevance)
        if (!this.searchQuery) {
            notes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        }

        this.displayNotesList(notes, notesList);
    }

    displayNotesList(notes, notesList) {
        if (notes.length === 0) {
            notesList.innerHTML = `
                <div class="empty-notes">
                    <p>${this.searchQuery ? 'No notes found matching your search.' : 'No notes yet.'}</p>
                </div>
            `;
            return;
        }

        notesList.innerHTML = notes.map(note => {
            const category = getCategoryByName(note.category);
            const categoryColor = category ? category.color : '#f0f0f0';
            const relativeTime = getRelativeTime(note.lastModified);
            
            // Highlight search terms if there's a search query
            let title = this.escapeHtml(note.title);
            let content = this.escapeHtml(note.content.substring(0, 100));
            
            if (this.searchQuery) {
                title = highlightSearchTerms(title, this.searchQuery);
                content = highlightSearchTerms(content, this.searchQuery);
            }
            
            return `
                <div class="note-item" data-note-id="${note.id}">
                    <div class="note-preview">
                        <div class="note-thumbnail">
                            <div class="note-icon" style="background: linear-gradient(135deg, ${categoryColor}, ${categoryColor}aa);">
                                ${category?.icon || '📝'}
                            </div>
                        </div>
                        <div class="note-content">
                            <h3>${title}</h3>
                            <p>${content}${note.content.length > 100 ? '...' : ''}</p>
                            <div class="note-meta">
                                <span class="note-date">${relativeTime}</span>
                                <div class="note-tags">
                                    ${note.category ? `<span class="tag" style="background-color: ${categoryColor}; color: white;">#${note.category}</span>` : ''}
                                    ${note.score ? `<span class="relevance-score">${Math.round(note.score * 2)} match${Math.round(note.score * 2) === 1 ? '' : 'es'}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Bind click events for notes
        notesList.querySelectorAll('.note-item').forEach(item => {
            item.addEventListener('click', () => {
                const noteId = item.dataset.noteId;
                this.selectNote(noteId);
            });
        });
    }

    renderMainContent() {
        const contentArea = document.querySelector('.content-area');
        if (!contentArea) return;

        if (this.currentNoteId) {
            const note = getNoteById(this.currentNoteId);
            if (note) {
                const category = getCategoryByName(note.category);
                const formattedDate = formatTimestamp(note.lastModified);
                
                contentArea.innerHTML = `
                    <article class="note-content">
                        <header class="note-header">
                            <div class="note-header-top">
                                <h1 contenteditable="true" class="note-title" data-field="title">${this.escapeHtml(note.title)}</h1>
                                <button class="delete-note-btn" title="Delete note">🗑️</button>
                            </div>
                            <div class="note-meta-info">
                                <span class="note-date">Last modified: ${formattedDate}</span>
                                ${note.category ? `<span class="note-category" style="background-color: ${category?.color || '#f0f0f0'}; color: white;">#${note.category}</span>` : ''}
                            </div>
                        </header>
                        <div class="note-body">
                            <div contenteditable="true" class="note-editor" data-field="content">${this.formatNoteContent(note.content)}</div>
                        </div>
                    </article>
                `;

                // Bind editing events
                const editableElements = contentArea.querySelectorAll('[contenteditable="true"]');
                editableElements.forEach(element => {
                    element.addEventListener('input', () => {
                        this.handleNoteEdit();
                    });
                    
                    element.addEventListener('blur', () => {
                        this.saveCurrentNote();
                    });
                });

                // Bind delete button event
                const deleteBtn = contentArea.querySelector('.delete-note-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => {
                        this.handleDeleteNote(note.id);
                    });
                }
            }
        } else {
            contentArea.innerHTML = `
                <div class="empty-state">
                    <h2>Select a note to view</h2>
                    <p>Choose a note from the list to see its content here, or create a new note to get started.</p>
                </div>
            `;
        }
    }

    selectNote(noteId) {
        // Save current note if editing
        if (this.currentNoteId && this.isEditing) {
            this.saveCurrentNote();
        }

        this.currentNoteId = noteId;
        this.isEditing = false;
        
        // Update selected state in notes list
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = document.querySelector(`[data-note-id="${noteId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }

        this.renderMainContent();
    }

    createNewNote() {
        this.showCreateNoteModal();
    }

    showCreateNoteModal() {
        const modal = document.getElementById('note-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Populate category dropdown
            const categorySelect = document.getElementById('note-category');
            if (categorySelect) {
                categorySelect.innerHTML = '<option value="">No Category</option>';
                const categories = getAllCategories();
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
                
                // Pre-select current category if applicable
                if (this.currentCategory !== 'all' && this.currentCategory !== 'untagged') {
                    categorySelect.value = this.currentCategory;
                }
            }
            
            // Focus on the title input
            const titleInput = document.getElementById('note-title');
            if (titleInput) {
                setTimeout(() => titleInput.focus(), 100);
            }
        }
    }

    hideCreateNoteModal() {
        const modal = document.getElementById('note-modal');
        const form = document.getElementById('note-form');
        if (modal) {
            modal.style.display = 'none';
        }
        if (form) {
            form.reset();
        }
    }

    handleCreateNote() {
        const titleInput = document.getElementById('note-title');
        const contentInput = document.getElementById('note-content');
        const categorySelect = document.getElementById('note-category');
        const errorDiv = document.getElementById('note-error');

        if (!titleInput || !contentInput || !categorySelect) return;

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const category = categorySelect.value;

        // Clear previous errors
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }

        if (!title) {
            this.showNoteError('Note title is required');
            return;
        }

        if (!content) {
            this.showNoteError('Note content is required');
            return;
        }

        try {
            const newNote = createNote(title, content, category);
            this.currentNoteId = newNote.id;
            this.hideCreateNoteModal();
            this.renderSidebar();
            this.renderNotesList();
            this.renderMainContent();
            console.log('Note created successfully:', title);
        } catch (error) {
            this.showNoteError(error.message);
        }
    }

    showNoteError(message) {
        const errorDiv = document.getElementById('note-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    handleNoteEdit() {
        this.isEditing = true;
        // Auto-save after 1 second of inactivity
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.saveCurrentNote();
        }, 1000);
    }

    saveCurrentNote() {
        if (!this.currentNoteId || !this.isEditing) return;

        const titleElement = document.querySelector('.note-title');
        const contentElement = document.querySelector('.note-editor');
        
        if (titleElement && contentElement) {
            const title = titleElement.textContent.trim() || 'Untitled Note';
            const content = contentElement.textContent.trim() || '';
            
            const note = getNoteById(this.currentNoteId);
            if (note) {
                editNote(this.currentNoteId, title, content, note.category);
                this.isEditing = false;
                
                // Update the notes list to reflect changes
                this.renderNotesList();
            }
        }
    }

    handleSearch(query) {
        this.searchQuery = query.trim();
        
        if (this.searchQuery) {
            // Use full-text search with relevance scoring
            const searchResults = fullTextSearch(this.searchQuery);
            this.displaySearchResults(searchResults);
            
            console.log(`Search results: ${searchResults.length} notes found`);
        } else {
            // Show all notes when search is cleared
            this.renderNotesList();
        }
    }

    /**
     * Perform a search and save it to history
     * @param {string} query - Search query
     */
    performSearch(query) {
        const trimmedQuery = query.trim();
        
        if (trimmedQuery) {
            // Save search to history
            saveSearchHistory(trimmedQuery, {});
            
            // Perform the search
            this.handleSearch(trimmedQuery);
            
            // Update search input placeholder to show search was performed
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                const originalPlaceholder = searchInput.getAttribute('data-original-placeholder') || 'Search notes...';
                searchInput.placeholder = `Searched: "${trimmedQuery}"`;
                setTimeout(() => {
                    searchInput.placeholder = originalPlaceholder;
                }, 2000);
            }
            
            console.log(`Search performed and saved: "${trimmedQuery}"`);
        }
    }

    // ===== SEARCH HISTORY METHODS =====

    /**
     * Initialize search history functionality
     */
    initializeSearchHistory() {
        const searchInput = document.getElementById('search-input');
        const searchHistoryDropdown = document.getElementById('search-history-dropdown');
        const clearHistoryBtn = document.getElementById('clear-history-btn');

        if (!searchInput || !searchHistoryDropdown) return;

        // Show search history on input focus
        searchInput.addEventListener('focus', () => {
            this.showSearchHistory();
        });

        // Hide search history when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchHistoryDropdown.contains(e.target)) {
                this.hideSearchHistory();
            }
        });

        // Handle clear history button
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearSearchHistory();
            });
        }

        // Handle keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateSearchHistory(e.key);
            } else if (e.key === 'Enter') {
                // Check if there's a selected history item
                const selectedItem = document.querySelector('.search-history-item.selected');
                if (selectedItem) {
                    e.preventDefault();
                    const query = selectedItem.dataset.query;
                    searchInput.value = query;
                    this.performSearch(query);
                    this.hideSearchHistory();
                } else {
                    // Regular search execution
                    e.preventDefault();
                    this.performSearch(searchInput.value);
                    this.hideSearchHistory();
                }
            }
        });
    }

    /**
     * Show search history dropdown
     */
    showSearchHistory() {
        const dropdown = document.getElementById('search-history-dropdown');
        if (!dropdown) return;

        this.populateSearchHistory();
        dropdown.classList.add('show');
    }

    /**
     * Hide search history dropdown
     */
    hideSearchHistory() {
        const dropdown = document.getElementById('search-history-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }

    /**
     * Populate search history dropdown with recent searches
     */
    populateSearchHistory() {
        const historyList = document.getElementById('search-history-list');
        if (!historyList) return;

        const searchHistory = getSearchHistory(10);
        
        if (searchHistory.length === 0) {
            historyList.innerHTML = '<div class="search-history-empty">No recent searches</div>';
            return;
        }

        historyList.innerHTML = searchHistory.map((item, index) => {
            const timeAgo = this.getTimeAgo(new Date(item.timestamp));
            return `
                <div class="search-history-item" data-index="${index}" data-query="${this.escapeHtml(item.query)}">
                    <span class="search-history-query">${this.escapeHtml(item.query)}</span>
                    <span class="search-history-time">${timeAgo}</span>
                </div>
            `;
        }).join('');

        // Add click handlers to history items
        historyList.querySelectorAll('.search-history-item').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.dataset.query;
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.value = query;
                    this.performSearch(query);
                }
                this.hideSearchHistory();
            });
        });
    }

    /**
     * Clear search history
     */
    clearSearchHistory() {
        clearSearchHistory();
        this.populateSearchHistory();
        console.log('Search history cleared');
    }

    /**
     * Navigate search history with keyboard
     */
    navigateSearchHistory(key) {
        const historyItems = document.querySelectorAll('.search-history-item');
        const searchInput = document.getElementById('search-input');
        
        if (!historyItems.length || !searchInput) return;

        let currentIndex = -1;
        historyItems.forEach((item, index) => {
            if (item.classList.contains('selected')) {
                currentIndex = index;
            }
        });

        if (key === 'ArrowDown') {
            currentIndex = Math.min(currentIndex + 1, historyItems.length - 1);
        } else if (key === 'ArrowUp') {
            currentIndex = Math.max(currentIndex - 1, -1);
        }

        // Remove previous selection
        historyItems.forEach(item => item.classList.remove('selected'));

        // Apply new selection
        if (currentIndex >= 0) {
            historyItems[currentIndex].classList.add('selected');
            const query = historyItems[currentIndex].dataset.query;
            searchInput.value = query;
        } else {
            searchInput.value = '';
        }
    }

    /**
     * Get time ago string for timestamps
     */
    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    }

    filterByCategory(categoryName) {
        this.currentCategory = categoryName;
        this.searchQuery = ''; // Clear search when filtering by category
        
        // Clear search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Update active category in sidebar
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-category="${categoryName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        this.renderNotesList();
    }

    formatNoteContent(content) {
        // Basic markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>')
            .replace(/#(\w+)/g, '<span class="tag-highlight">#$1</span>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showCreateCategoryModal() {
        const modal = document.getElementById('category-modal');
        if (modal) {
            modal.style.display = 'flex';
            // Focus on the name input
            const nameInput = document.getElementById('category-name');
            if (nameInput) {
                setTimeout(() => nameInput.focus(), 100);
            }
        }
    }

    hideCreateCategoryModal() {
        const modal = document.getElementById('category-modal');
        const form = document.getElementById('category-form');
        if (modal) {
            modal.style.display = 'none';
        }
        if (form) {
            form.reset();
        }
    }

    handleCreateCategory() {
        const nameInput = document.getElementById('category-name');
        const colorInput = document.getElementById('category-color');
        const iconInput = document.getElementById('category-icon');
        const errorDiv = document.getElementById('category-error');

        if (!nameInput || !colorInput || !iconInput) return;

        const name = nameInput.value.trim();
        const color = colorInput.value;
        const icon = iconInput.value.trim() || '📁';

        // Clear previous errors
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }

        if (!name) {
            this.showCategoryError('Category name is required');
            return;
        }

        try {
            createCategory(name, color, icon);
            this.hideCreateCategoryModal();
            this.renderSidebar();
            console.log('Category created successfully:', name);
        } catch (error) {
            this.showCategoryError(error.message);
        }
    }

    showCategoryError(message) {
        const errorDiv = document.getElementById('category-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    handleDeleteNote(noteId) {
        const note = getNoteById(noteId);
        if (!note) return;

        const confirmMessage = `Are you sure you want to delete "${note.title}"? This action cannot be undone.`;
        if (confirm(confirmMessage)) {
            const success = deleteNote(noteId);
            if (success) {
                // Clear current note view
                this.currentNoteId = null;
                
                // Update all UI components
                this.renderSidebar();
                this.renderNotesList();
                this.renderMainContent();
                
                console.log('Note deleted successfully');
            } else {
                alert('Failed to delete note. Please try again.');
            }
        }
    }

    showDeleteCategoryModal(categoryId, categoryName) {
        this.categoryToDelete = { id: categoryId, name: categoryName };
        const modal = document.getElementById('delete-category-modal');
        const message = document.getElementById('delete-category-message');
        
        if (modal && message) {
            message.textContent = `Are you sure you want to delete the category "${categoryName}"?`;
            modal.style.display = 'flex';
        }
    }

    hideDeleteCategoryModal() {
        const modal = document.getElementById('delete-category-modal');
        if (modal) {
            modal.style.display = 'none';
            this.categoryToDelete = null;
        }
    }

    handleDeleteCategory() {
        if (!this.categoryToDelete) return;

        const { id, name } = this.categoryToDelete;
        
        if (deleteCategory(id)) {
            // If we're currently viewing the deleted category, switch to 'all'
            if (this.currentCategory === name) {
                this.currentCategory = 'all';
            }
            
            this.hideDeleteCategoryModal();
            this.renderSidebar();
            this.renderNotesList();
            this.renderMainContent();
        } else {
            alert('Failed to delete category. Please try again.');
        }
    }

    // ===== ADVANCED SEARCH METHODS =====

    /**
     * Initialize advanced search functionality
     * @returns {void}
     */
    initializeAdvancedSearch() {
        // TODO: Implement advanced search initialization
        // - Set up keyboard shortcuts (Ctrl+K)
        // - Initialize search history
        // - Set up advanced search panel
    }

    /**
     * Handle keyboard shortcuts for search
     * @param {KeyboardEvent} event - Keyboard event
     * @returns {void}
     */
    handleSearchKeyboardShortcuts(event) {
        // TODO: Implement search keyboard shortcuts
        // - Handle Ctrl+K for quick search
        // - Handle Escape to clear search
        // - Handle Enter to execute search
    }

    /**
     * Show advanced search panel
     * @returns {void}
     */
    showAdvancedSearchPanel() {
        // TODO: Implement advanced search panel display
        // - Show search criteria form
        // - Display search history
        // - Show saved searches
    }

    /**
     * Hide advanced search panel
     * @returns {void}
     */
    hideAdvancedSearchPanel() {
        // TODO: Implement advanced search panel hiding
        // - Hide search panel
        // - Clear search criteria
        // - Reset search state
    }

    /**
     * Execute advanced search
     * @param {Object} criteria - Search criteria
     * @returns {void}
     */
    executeAdvancedSearch(criteria) {
        // TODO: Implement advanced search execution
        // - Call advancedSearch function
        // - Update search results display
        // - Save to search history
        // - Update UI state
    }

    /**
     * Display search results with highlighting
     * @param {Array} results - Search results
     * @returns {void}
     */
    displaySearchResults(results) {
        const notesList = document.querySelector('.notes-list');
        if (!notesList) return;

        if (results.length === 0) {
            notesList.innerHTML = `
                <div class="empty-notes">
                    <p>No notes found matching "${this.searchQuery}"</p>
                    <p>Try different keywords or check your spelling.</p>
                </div>
            `;
            return;
        }

        // Display results with highlighting and relevance scores
        this.displayNotesList(results, notesList);

        // Show search summary
        const searchSummary = document.createElement('div');
        searchSummary.className = 'search-summary';
        searchSummary.innerHTML = `
            <p>Found ${results.length} note${results.length === 1 ? '' : 's'} for "${this.searchQuery}"</p>
            <button class="clear-search-btn" onclick="window.bearNotesApp.clearSearch()">Clear Search</button>
        `;
        
        notesList.insertBefore(searchSummary, notesList.firstChild);
    }

    clearSearch() {
        this.searchQuery = '';
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        this.renderNotesList();
    }

    // ===== RICH TEXT EDITING METHODS =====

    /**
     * Initialize rich text editing
     * @returns {void}
     */
    initializeRichTextEditing() {
        // TODO: Implement rich text editing initialization
        // - Set up markdown editor
        // - Initialize formatting toolbar
        // - Set up paste handlers
        // - Configure code highlighting
    }

    /**
     * Toggle markdown preview mode
     * @returns {void}
     */
    toggleMarkdownPreview() {
        // TODO: Implement markdown preview toggle
        // - Switch between edit and preview modes
        // - Convert markdown to HTML for preview
        // - Update editor state
        // - Show/hide formatting toolbar
    }

    /**
     * Handle image upload
     * @param {File} file - Image file
     * @returns {Promise<string>} - Image URL
     */
    async handleImageUpload(file) {
        // TODO: Implement image upload handling
        // - Validate image file
        // - Convert to base64 or upload
        // - Insert image into editor
        // - Return image URL
    }

    /**
     * Show formatting toolbar
     * @returns {void}
     */
    showFormattingToolbar() {
        // TODO: Implement formatting toolbar display
        // - Show toolbar with formatting buttons
        // - Position toolbar appropriately
        // - Handle toolbar interactions
    }

    /**
     * Hide formatting toolbar
     * @returns {void}
     */
    hideFormattingToolbar() {
        // TODO: Implement formatting toolbar hiding
        // - Hide toolbar
        // - Clean up event listeners
        // - Reset toolbar state
    }

    // ===== EXPORT/IMPORT METHODS =====

    /**
     * Initialize export/import functionality
     * @returns {void}
     */
    initializeExportImport() {
        // Export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.showExportDialog();
            });
        }

        // Import button
        const importBtn = document.getElementById('import-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.showImportDialog();
            });
        }

        // Export modal events
        const exportModal = document.getElementById('export-modal');
        const confirmExportBtn = document.getElementById('confirm-export');
        const cancelExportBtn = document.getElementById('cancel-export');

        if (confirmExportBtn) {
            confirmExportBtn.addEventListener('click', () => {
                this.handleExport();
            });
        }

        if (cancelExportBtn) {
            cancelExportBtn.addEventListener('click', () => {
                this.hideExportDialog();
            });
        }

        // Import modal events
        const importModal = document.getElementById('import-modal');
        const confirmImportBtn = document.getElementById('confirm-import');
        const cancelImportBtn = document.getElementById('cancel-import');

        if (confirmImportBtn) {
            confirmImportBtn.addEventListener('click', () => {
                this.handleImport();
            });
        }

        if (cancelImportBtn) {
            cancelImportBtn.addEventListener('click', () => {
                this.hideImportDialog();
            });
        }

        // Close modal events
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.hideExportDialog();
                this.hideImportDialog();
            });
        });
    }

    /**
     * Show export dialog
     * @returns {void}
     */
    showExportDialog() {
        const exportModal = document.getElementById('export-modal');
        if (exportModal) {
            exportModal.style.display = 'flex';
            // Reset form
            document.querySelector('input[name="export-format"][value="json"]').checked = true;
            document.querySelector('input[name="export-scope"][value="all"]').checked = true;
            document.getElementById('export-error').textContent = '';
        }
    }

    /**
     * Hide export dialog
     * @returns {void}
     */
    hideExportDialog() {
        const exportModal = document.getElementById('export-modal');
        if (exportModal) {
            exportModal.style.display = 'none';
        }
    }

    /**
     * Show import dialog
     * @returns {void}
     */
    showImportDialog() {
        const importModal = document.getElementById('import-modal');
        if (importModal) {
            importModal.style.display = 'flex';
            // Reset form
            document.querySelector('input[name="import-format"][value="json"]').checked = true;
            document.getElementById('duplicate-strategy').value = 'rename';
            document.getElementById('import-files').value = '';
            document.getElementById('import-error').textContent = '';
        }
    }

    /**
     * Hide import dialog
     * @returns {void}
     */
    hideImportDialog() {
        const importModal = document.getElementById('import-modal');
        if (importModal) {
            importModal.style.display = 'none';
        }
    }

    /**
     * Handle export execution
     * @returns {Promise<void>}
     */
    async handleExport() {
        try {
            const format = document.querySelector('input[name="export-format"]:checked').value;
            const scope = document.querySelector('input[name="export-scope"]:checked').value;
            
            let content;
            let filename;

            if (scope === 'current' && this.currentNoteId) {
                const note = getNoteById(this.currentNoteId);
                if (note) {
                    content = await exportNote(note, format);
                    filename = generateExportFilename(format, note.title);
                } else {
                    throw new Error('Current note not found');
                }
            } else {
                // Export all notes
                if (format === 'json') {
                    content = exportToJson();
                } else if (format === 'markdown') {
                    content = exportToMarkdown();
                } else if (format === 'pdf') {
                    content = await exportToPdf();
                }
                filename = generateExportFilename(format);
            }

            if (content) {
                this.downloadFile(content, filename, this.getMimeType(format));
                this.hideExportDialog();
            } else {
                throw new Error('Failed to generate export content');
            }
        } catch (error) {
            console.error('Export error:', error);
            document.getElementById('export-error').textContent = `Export failed: ${error.message}`;
        }
    }

    /**
     * Handle import execution
     * @returns {Promise<void>}
     */
    async handleImport() {
        try {
            const format = document.querySelector('input[name="import-format"]:checked').value;
            const duplicateStrategy = document.getElementById('duplicate-strategy').value;
            const files = document.getElementById('import-files').files;

            if (!files || files.length === 0) {
                throw new Error('Please select files to import');
            }

            let importedNotes = [];

            if (format === 'json') {
                if (files.length > 1) {
                    throw new Error('JSON import supports only one file');
                }
                importedNotes = await importFromJson(files[0]);
            } else if (format === 'markdown') {
                importedNotes = await importFromMarkdown(Array.from(files));
            }

            // Validate imported data
            const validation = validateImportData(importedNotes);
            if (!validation.valid) {
                throw new Error(validation.message);
            }

            // Merge notes
            const mergedNotes = mergeImportedNotes(importedNotes, { duplicateStrategy });
            
            // Update localStorage with merged notes
            localStorage.setItem('notes', JSON.stringify(mergedNotes));
            
            // Refresh the app
            this.renderNotesList();
            this.renderSidebar();
            
            this.hideImportDialog();
            alert(`Successfully imported ${importedNotes.length} notes!`);
        } catch (error) {
            console.error('Import error:', error);
            document.getElementById('import-error').textContent = `Import failed: ${error.message}`;
        }
    }

    /**
     * Download file with proper filename
     * @param {Blob|string} content - File content
     * @param {string} filename - Filename
     * @param {string} mimeType - MIME type
     * @returns {void}
     */
    downloadFile(content, filename, mimeType = 'application/octet-stream') {
        let blob;
        if (typeof content === 'string') {
            blob = new Blob([content], { type: mimeType });
        } else {
            blob = content;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Get MIME type for export format
     * @param {string} format - Export format
     * @returns {string} - MIME type
     */
    getMimeType(format) {
        switch (format) {
            case 'json':
                return 'application/json';
            case 'markdown':
                return 'text/markdown';
            case 'pdf':
                return 'application/pdf';
            default:
                return 'application/octet-stream';
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bearNotesApp = new BearNotesApp();
});