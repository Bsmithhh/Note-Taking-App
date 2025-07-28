const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validate } = require('../utils/validation');

// Import note controller (we'll create this next)
const noteController = require('../controllers/noteController');

// All routes require authentication
router.use(auth);

// GET /api/notes - Get all notes with pagination and filters
router.get('/', validate('getNotes'), noteController.getNotes);

// GET /api/notes/:id - Get single note
router.get('/:id', validate('getNote'), noteController.getNote);

// POST /api/notes - Create new note
router.post('/', validate('createNote'), noteController.createNote);

// PUT /api/notes/:id - Update note
router.put('/:id', validate('updateNote'), noteController.updateNote);

// DELETE /api/notes/:id - Delete note
router.delete('/:id', validate('getNote'), noteController.deleteNote);

// PATCH /api/notes/:id/pin - Toggle pin status
router.patch('/:id/pin', validate('getNote'), noteController.togglePin);

// PATCH /api/notes/:id/archive - Toggle archive status
router.patch('/:id/archive', validate('getNote'), noteController.toggleArchive);

// PATCH /api/notes/:id/public - Toggle public status
router.patch('/:id/public', validate('getNote'), noteController.togglePublic);

// POST /api/notes/:id/duplicate - Duplicate note
router.post('/:id/duplicate', validate('getNote'), noteController.duplicateNote);

// GET /api/notes/search/:query - Search notes
router.get('/search/:query', noteController.searchNotes);

// GET /api/notes/stats - Get note statistics
router.get('/stats/overview', noteController.getNoteStats);

// POST /api/notes/bulk-delete - Bulk delete notes
router.post('/bulk-delete', noteController.bulkDeleteNotes);

// POST /api/notes/bulk-move - Bulk move notes to category
router.post('/bulk-move', noteController.bulkMoveNotes);

// POST /api/notes/import - Import notes from file
router.post('/import', noteController.importNotes);

// GET /api/notes/export - Export notes
router.get('/export', noteController.exportNotes);

module.exports = router; 