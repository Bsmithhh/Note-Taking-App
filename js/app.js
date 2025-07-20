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
    sortByDate,
    textMatchesQuery
} from './search.js';

class BearNotesApp {
    constructor() {
        this.currentNoteId = null;
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.isEditing = false;
        this.categoryToDelete = null;
        
        this.initializeApp();
        this.bindEvents();
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
            notes = searchNotes(this.searchQuery);
        } else if (this.currentCategory === 'all') {
            notes = getAllNotes();
        } else if (this.currentCategory === 'untagged') {
            notes = getAllNotes().filter(note => !note.category || note.category === '');
        } else {
            notes = getNotesByCategory(this.currentCategory);
        }

        // Sort by most recent
        notes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

        notesList.innerHTML = notes.map(note => {
            const category = getCategoryByName(note.category);
            const categoryColor = category ? category.color : '#f0f0f0';
            const relativeTime = getRelativeTime(note.lastModified);
            
            return `
                <div class="note-item" data-note-id="${note.id}">
                    <div class="note-preview">
                        <div class="note-thumbnail">
                            <div class="note-icon" style="background: linear-gradient(135deg, ${categoryColor}, ${categoryColor}aa);">
                                ${category?.icon || '📝'}
                            </div>
                        </div>
                        <div class="note-content">
                            <h3>${this.escapeHtml(note.title)}</h3>
                            <p>${this.escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</p>
                            <div class="note-meta">
                                <span class="note-date">${relativeTime}</span>
                                <div class="note-tags">
                                    ${note.category ? `<span class="tag" style="background-color: ${categoryColor}; color: white;">#${note.category}</span>` : ''}
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
        this.renderNotesList();
        
        // Update search results count
        const notes = this.searchQuery ? searchNotes(this.searchQuery) : getAllNotes();
        console.log(`Search results: ${notes.length} notes found`);
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
        // TODO: Implement search results display
        // - Highlight search terms in results
        // - Show relevance scores
        // - Update notes list with results
        // - Show result count
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
        // TODO: Implement export/import initialization
        // - Set up export/import buttons
        // - Initialize backup system
        // - Set up file handlers
    }

    /**
     * Show export dialog
     * @param {string} format - Export format
     * @returns {void}
     */
    showExportDialog(format) {
        // TODO: Implement export dialog display
        // - Show export options
        // - Allow format selection
        // - Handle export execution
    }

    /**
     * Show import dialog
     * @returns {void}
     */
    showImportDialog() {
        // TODO: Implement import dialog display
        // - Show file upload interface
        // - Handle file selection
        // - Validate import data
    }

    /**
     * Handle file upload for import
     * @param {FileList} files - Uploaded files
     * @returns {Promise<void>}
     */
    async handleFileUpload(files) {
        // TODO: Implement file upload handling
        // - Process uploaded files
        // - Validate file types
        // - Import data from files
        // - Update UI after import
    }

    /**
     * Show backup management dialog
     * @returns {void}
     */
    showBackupDialog() {
        // TODO: Implement backup dialog display
        // - Show backup history
        // - Allow backup creation/restoration
        // - Handle backup management
    }

    /**
     * Create manual backup
     * @returns {Promise<void>}
     */
    async createManualBackup() {
        // TODO: Implement manual backup creation
        // - Create backup of current data
        // - Show backup progress
        // - Update backup history
        // - Provide feedback to user
    }

    /**
     * Show statistics dashboard
     * @returns {void}
     */
    showStatisticsDashboard() {
        // TODO: Implement statistics dashboard display
        // - Generate note statistics
        // - Display charts and metrics
        // - Show activity reports
        // - Allow export of statistics
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bearNotesApp = new BearNotesApp();
});