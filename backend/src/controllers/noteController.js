const Note = require('../models/Note');
const Category = require('../models/Category');

// @desc    Get all notes with pagination and filters
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      category,
      search,
      isArchived = false,
      isPinned,
      tags
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      category,
      search,
      isArchived: isArchived === 'true',
      isPinned: isPinned !== undefined ? isPinned === 'true' : null
    };

    if (tags) {
      options.tags = tags.split(',').map(tag => tag.trim());
    }

    const result = await Note.getUserNotes(req.user._id, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes'
    });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('category', 'name color');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      data: { note }
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch note'
    });
  }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const {
      title,
      content = '',
      category,
      tags = [],
      isPinned = false,
      isPublic = false,
      priority = 'medium',
      color = '#ffffff'
    } = req.body;

    const noteData = {
      userId: req.user._id,
      title,
      content,
      tags,
      isPinned,
      isPublic,
      priority,
      color,
      metadata: {
        lastEditedBy: req.user._id
      }
    };

    if (category) {
      // Verify category belongs to user
      const categoryExists = await Category.findOne({
        _id: category,
        userId: req.user._id
      });
      
      if (categoryExists) {
        noteData.category = category;
      }
    }

    const note = new Note(noteData);
    await note.save();

    // Update category note count if category exists
    if (note.category) {
      await Category.findByIdAndUpdate(note.category, {
        $inc: { 'metadata.noteCount': 1 },
        'metadata.lastUsed': new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: { note }
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create note'
    });
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    const oldCategory = note.category;
    const {
      title,
      content,
      category,
      tags,
      isPinned,
      isPublic,
      isArchived,
      priority,
      color
    } = req.body;

    // Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (isPublic !== undefined) note.isPublic = isPublic;
    if (isArchived !== undefined) note.isArchived = isArchived;
    if (priority !== undefined) note.priority = priority;
    if (color !== undefined) note.color = color;
    if (category !== undefined) {
      if (category) {
        // Verify category belongs to user
        const categoryExists = await Category.findOne({
          _id: category,
          userId: req.user._id
        });
        
        if (categoryExists) {
          note.category = category;
        }
      } else {
        note.category = null;
      }
    }

    note.metadata.lastEditedBy = req.user._id;
    note.addToHistory();

    await note.save();

    // Update category note counts
    if (oldCategory && oldCategory.toString() !== (note.category || '').toString()) {
      // Decrease count for old category
      await Category.findByIdAndUpdate(oldCategory, {
        $inc: { 'metadata.noteCount': -1 }
      });
      
      // Increase count for new category
      if (note.category) {
        await Category.findByIdAndUpdate(note.category, {
          $inc: { 'metadata.noteCount': 1 },
          'metadata.lastUsed': new Date()
        });
      }
    }

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: { note }
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note'
    });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Update category note count
    if (note.category) {
      await Category.findByIdAndUpdate(note.category, {
        $inc: { 'metadata.noteCount': -1 }
      });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note'
    });
  }
};

// @desc    Toggle pin status
// @route   PATCH /api/notes/:id/pin
// @access  Private
const togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.json({
      success: true,
      message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: { note }
    });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle pin status'
    });
  }
};

// @desc    Toggle archive status
// @route   PATCH /api/notes/:id/archive
// @access  Private
const toggleArchive = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note.isArchived = !note.isArchived;
    await note.save();

    res.json({
      success: true,
      message: `Note ${note.isArchived ? 'archived' : 'unarchived'} successfully`,
      data: { note }
    });
  } catch (error) {
    console.error('Toggle archive error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle archive status'
    });
  }
};

// @desc    Toggle public status
// @route   PATCH /api/notes/:id/public
// @access  Private
const togglePublic = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note.isPublic = !note.isPublic;
    await note.save();

    res.json({
      success: true,
      message: `Note ${note.isPublic ? 'made public' : 'made private'} successfully`,
      data: { note }
    });
  } catch (error) {
    console.error('Toggle public error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle public status'
    });
  }
};

// @desc    Duplicate note
// @route   POST /api/notes/:id/duplicate
// @access  Private
const duplicateNote = async (req, res) => {
  try {
    const originalNote = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!originalNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    const duplicatedNote = new Note({
      userId: req.user._id,
      title: `${originalNote.title} (Copy)`,
      content: originalNote.content,
      category: originalNote.category,
      tags: originalNote.tags,
      priority: originalNote.priority,
      color: originalNote.color,
      metadata: {
        lastEditedBy: req.user._id
      }
    });

    await duplicatedNote.save();

    // Update category note count
    if (duplicatedNote.category) {
      await Category.findByIdAndUpdate(duplicatedNote.category, {
        $inc: { 'metadata.noteCount': 1 },
        'metadata.lastUsed': new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Note duplicated successfully',
      data: { note: duplicatedNote }
    });
  } catch (error) {
    console.error('Duplicate note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate note'
    });
  }
};

// @desc    Search notes
// @route   GET /api/notes/search/:query
// @access  Private
const searchNotes = async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const searchResults = await Note.find({
      userId: req.user._id,
      $text: { $search: query }
    })
    .populate('category', 'name color')
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .lean();

    const total = await Note.countDocuments({
      userId: req.user._id,
      $text: { $search: query }
    });

    res.json({
      success: true,
      data: {
        notes: searchResults,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
          hasNext: parseInt(page) * parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Search notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search notes'
    });
  }
};

// @desc    Get note statistics
// @route   GET /api/notes/stats/overview
// @access  Private
const getNoteStats = async (req, res) => {
  try {
    const stats = await Note.getUserStats(req.user._id);

    // Get additional stats
    const totalCategories = await Category.countDocuments({
      userId: req.user._id,
      isActive: true
    });

    const recentNotes = await Note.countDocuments({
      userId: req.user._id,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const pinnedNotes = await Note.countDocuments({
      userId: req.user._id,
      isPinned: true,
      isArchived: false
    });

    res.json({
      success: true,
      data: {
        ...stats,
        totalCategories,
        recentNotes,
        pinnedNotes,
        averageWordsPerNote: stats.totalNotes > 0 ? Math.round(stats.totalWords / stats.totalNotes) : 0,
        averageCharactersPerNote: stats.totalNotes > 0 ? Math.round(stats.totalCharacters / stats.totalNotes) : 0
      }
    });
  } catch (error) {
    console.error('Get note stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get note statistics'
    });
  }
};

// @desc    Bulk delete notes
// @route   POST /api/notes/bulk-delete
// @access  Private
const bulkDeleteNotes = async (req, res) => {
  try {
    const { noteIds } = req.body;

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note IDs array is required'
      });
    }

    const notes = await Note.find({
      _id: { $in: noteIds },
      userId: req.user._id
    });

    if (notes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No notes found to delete'
      });
    }

    // Update category note counts
    const categoryUpdates = {};
    notes.forEach(note => {
      if (note.category) {
        const categoryId = note.category.toString();
        categoryUpdates[categoryId] = (categoryUpdates[categoryId] || 0) - 1;
      }
    });

    // Apply category updates
    for (const [categoryId, count] of Object.entries(categoryUpdates)) {
      await Category.findByIdAndUpdate(categoryId, {
        $inc: { 'metadata.noteCount': count }
      });
    }

    await Note.deleteMany({
      _id: { $in: noteIds },
      userId: req.user._id
    });

    res.json({
      success: true,
      message: `${notes.length} note(s) deleted successfully`
    });
  } catch (error) {
    console.error('Bulk delete notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notes'
    });
  }
};

// @desc    Bulk move notes to category
// @route   POST /api/notes/bulk-move
// @access  Private
const bulkMoveNotes = async (req, res) => {
  try {
    const { noteIds, categoryId } = req.body;

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note IDs array is required'
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      });
    }

    // Verify category belongs to user
    const category = await Category.findOne({
      _id: categoryId,
      userId: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const notes = await Note.find({
      _id: { $in: noteIds },
      userId: req.user._id
    });

    if (notes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No notes found to move'
      });
    }

    // Update category note counts
    const oldCategoryCounts = {};
    notes.forEach(note => {
      if (note.category) {
        const categoryId = note.category.toString();
        oldCategoryCounts[categoryId] = (oldCategoryCounts[categoryId] || 0) - 1;
      }
    });

    // Apply old category updates
    for (const [categoryId, count] of Object.entries(oldCategoryCounts)) {
      await Category.findByIdAndUpdate(categoryId, {
        $inc: { 'metadata.noteCount': count }
      });
    }

    // Update notes and new category
    await Note.updateMany(
      { _id: { $in: noteIds }, userId: req.user._id },
      { category: categoryId }
    );

    await Category.findByIdAndUpdate(categoryId, {
      $inc: { 'metadata.noteCount': notes.length },
      'metadata.lastUsed': new Date()
    });

    res.json({
      success: true,
      message: `${notes.length} note(s) moved to ${category.name} successfully`
    });
  } catch (error) {
    console.error('Bulk move notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move notes'
    });
  }
};

// @desc    Import notes
// @route   POST /api/notes/import
// @access  Private
const importNotes = async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes || !Array.isArray(notes)) {
      return res.status(400).json({
        success: false,
        message: 'Notes array is required'
      });
    }

    const importedNotes = [];
    const errors = [];

    for (const noteData of notes) {
      try {
        const note = new Note({
          userId: req.user._id,
          title: noteData.title || 'Imported Note',
          content: noteData.content || '',
          category: null, // Will be handled separately
          tags: noteData.tags || [],
          isPinned: noteData.isPinned || false,
          isPublic: noteData.isPublic || false,
          priority: noteData.priority || 'medium',
          color: noteData.color || '#ffffff',
          metadata: {
            lastEditedBy: req.user._id
          }
        });

        await note.save();
        importedNotes.push(note);
      } catch (error) {
        errors.push({
          note: noteData.title || 'Unknown',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully imported ${importedNotes.length} note(s)`,
      data: {
        imported: importedNotes.length,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error) {
    console.error('Import notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import notes'
    });
  }
};

// @desc    Export notes
// @route   GET /api/notes/export
// @access  Private
const exportNotes = async (req, res) => {
  try {
    const { format = 'json', category } = req.query;

    const query = { userId: req.user._id };
    if (category) {
      query.category = category;
    }

    const notes = await Note.find(query)
      .populate('category', 'name color')
      .lean();

    if (format === 'json') {
      res.json({
        success: true,
        data: {
          notes,
          exportDate: new Date().toISOString(),
          totalNotes: notes.length
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format'
      });
    }
  } catch (error) {
    console.error('Export notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export notes'
    });
  }
};

module.exports = {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
  toggleArchive,
  togglePublic,
  duplicateNote,
  searchNotes,
  getNoteStats,
  bulkDeleteNotes,
  bulkMoveNotes,
  importNotes,
  exportNotes
}; 