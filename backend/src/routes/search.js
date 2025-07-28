const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Note = require('../models/Note');

// GET /api/search - Search notes
router.get('/', auth, async (req, res) => {
  try {
    const { q, category, dateFrom, dateTo, sortBy = 'lastModified', sortOrder = 'desc', limit = 50 } = req.query;
    
    const options = {
      category,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
      limit: parseInt(limit)
    };
    
    const notes = await Note.searchNotes(req.user._id, q, options);
    
    // Calculate relevance scores for text search
    if (q && q.trim()) {
      const queryWords = q.toLowerCase().split(/\s+/).filter(Boolean);
      
      notes.forEach(note => {
        let score = 0;
        queryWords.forEach(word => {
          if (note.title.toLowerCase().includes(word)) score += 1.0;
          if (note.content.toLowerCase().includes(word)) score += 1.0;
        });
        note.score = score;
      });
      
      // Sort by relevance score
      notes.sort((a, b) => b.score - a.score);
    }
    
    res.json({
      query: q,
      results: notes,
      totalResults: notes.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/search/suggestions - Get search suggestions
router.get('/suggestions', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const query = q.toLowerCase();
    
    // Get suggestions from note titles
    const titleSuggestions = await Note.find({
      userId: req.user._id,
      title: { $regex: query, $options: 'i' }
    })
    .select('title')
    .limit(5)
    .lean();
    
    // Get suggestions from note content (first few words)
    const contentSuggestions = await Note.find({
      userId: req.user._id,
      content: { $regex: query, $options: 'i' }
    })
    .select('content')
    .limit(5)
    .lean();
    
    // Get category suggestions
    const categorySuggestions = await Note.distinct('category', {
      userId: req.user._id,
      category: { $regex: query, $options: 'i' }
    });
    
    // Combine and deduplicate suggestions
    const suggestions = new Set();
    
    titleSuggestions.forEach(note => {
      suggestions.add(note.title);
    });
    
    contentSuggestions.forEach(note => {
      const words = note.content.split(/\s+/).filter(word => 
        word.toLowerCase().includes(query) && word.length > 2
      );
      words.slice(0, 3).forEach(word => suggestions.add(word));
    });
    
    categorySuggestions.forEach(category => {
      if (category) suggestions.add(category);
    });
    
    res.json({
      suggestions: Array.from(suggestions).slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// GET /api/search/advanced - Advanced search with multiple criteria
router.get('/advanced', auth, async (req, res) => {
  try {
    const {
      query,
      category,
      tags,
      dateFrom,
      dateTo,
      isArchived,
      isLocked,
      sortBy = 'lastModified',
      sortOrder = 'desc',
      limit = 50
    } = req.query;
    
    let searchQuery = { userId: req.user._id };
    
    // Text search
    if (query && query.trim()) {
      searchQuery.$text = { $search: query };
    }
    
    // Category filter
    if (category) {
      searchQuery.category = category;
    }
    
    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      searchQuery.tags = { $in: tagArray };
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      searchQuery.createdAt = {};
      if (dateFrom) searchQuery.createdAt.$gte = new Date(dateFrom);
      if (dateTo) searchQuery.createdAt.$lte = new Date(dateTo);
    }
    
    // Archive filter
    if (isArchived !== undefined) {
      searchQuery.isArchived = isArchived === 'true';
    }
    
    // Lock filter
    if (isLocked !== undefined) {
      searchQuery.isLocked = isLocked === 'true';
    }
    
    // Build sort object
    const sortObject = {};
    sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const notes = await Note.find(searchQuery)
      .sort(sortObject)
      .limit(parseInt(limit))
      .lean();
    
    // Calculate relevance scores for text search
    if (query && query.trim()) {
      const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
      
      notes.forEach(note => {
        let score = 0;
        queryWords.forEach(word => {
          if (note.title.toLowerCase().includes(word)) score += 1.0;
          if (note.content.toLowerCase().includes(word)) score += 1.0;
        });
        note.score = score;
      });
      
      // Sort by relevance score
      notes.sort((a, b) => b.score - a.score);
    }
    
    res.json({
      query,
      filters: { category, tags, dateFrom, dateTo, isArchived, isLocked },
      results: notes,
      totalResults: notes.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Advanced search failed' });
  }
});

// GET /api/search/history - Get search history
router.get('/history', auth, async (req, res) => {
  try {
    // For now, return empty array - search history can be implemented later
    // with a separate SearchHistory model
    res.json({ history: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get search history' });
  }
});

// POST /api/search/history - Save search to history
router.post('/history', auth, async (req, res) => {
  try {
    const { query, filters } = req.body;
    
    // For now, just return success - search history can be implemented later
    res.json({ message: 'Search saved to history' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save search history' });
  }
});

// DELETE /api/search/history - Clear search history
router.delete('/history', auth, async (req, res) => {
  try {
    // For now, just return success - search history can be implemented later
    res.json({ message: 'Search history cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear search history' });
  }
});

module.exports = router; 