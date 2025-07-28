const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Note = require('../models/Note');

// GET /api/notes - Get all notes for user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, sortBy = 'lastModified', sortOrder = 'desc' } = req.query;
    
    const query = { userId: req.user._id };
    if (category) query.category = category;
    
    const sortObject = {};
    sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const notes = await Note.find(query)
      .sort(sortObject)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await Note.countDocuments(query);
    
    res.json({
      notes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalNotes: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// GET /api/notes/:id - Get single note
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// POST /api/notes - Create new note
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const note = new Note({
      title,
      content,
      category: category || '',
      tags: tags || [],
      userId: req.user._id
    });
    
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// PUT /api/notes/:id - Update note
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, category, tags, isArchived, isLocked } = req.body;
    
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (category !== undefined) note.category = category;
    if (tags !== undefined) note.tags = tags;
    if (isArchived !== undefined) note.isArchived = isArchived;
    if (isLocked !== undefined) note.isLocked = isLocked;
    
    await note.save();
    res.json(note);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /api/notes/:id - Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// GET /api/notes/stats/overview - Get note statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const totalNotes = await Note.countDocuments({ userId: req.user._id });
    const archivedNotes = await Note.countDocuments({ userId: req.user._id, isArchived: true });
    const lockedNotes = await Note.countDocuments({ userId: req.user._id, isLocked: true });
    
    // Get notes created in last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentNotes = await Note.countDocuments({
      userId: req.user._id,
      createdAt: { $gte: lastWeek }
    });
    
    // Get total word count
    const notes = await Note.find({ userId: req.user._id }).select('title content');
    const totalWords = notes.reduce((sum, note) => {
      const titleWords = (note.title || '').split(/\s+/).filter(word => word.length > 0).length;
      const contentWords = (note.content || '').split(/\s+/).filter(word => word.length > 0).length;
      return sum + titleWords + contentWords;
    }, 0);
    
    res.json({
      totalNotes,
      archivedNotes,
      lockedNotes,
      recentNotes,
      totalWords,
      averageWordsPerNote: totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// POST /api/notes/bulk - Bulk operations
router.post('/bulk', auth, async (req, res) => {
  try {
    const { operation, noteIds, data } = req.body;
    
    if (!operation || !noteIds || !Array.isArray(noteIds)) {
      return res.status(400).json({ error: 'Invalid bulk operation parameters' });
    }
    
    let result;
    
    switch (operation) {
      case 'archive':
        result = await Note.updateMany(
          { _id: { $in: noteIds }, userId: req.user._id },
          { isArchived: true }
        );
        break;
      case 'unarchive':
        result = await Note.updateMany(
          { _id: { $in: noteIds }, userId: req.user._id },
          { isArchived: false }
        );
        break;
      case 'delete':
        result = await Note.deleteMany({ _id: { $in: noteIds }, userId: req.user._id });
        break;
      case 'update':
        result = await Note.updateMany(
          { _id: { $in: noteIds }, userId: req.user._id },
          data
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }
    
    res.json({ message: `Bulk operation completed`, modifiedCount: result.modifiedCount || result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform bulk operation' });
  }
});

module.exports = router; 