const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET all notes for user (with optional search & category filter)
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const { search, category } = req.query;

    let query = 'SELECT * FROM notes WHERE user_id = ?';
    const params = [userId];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search && search.trim()) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    query += ' ORDER BY is_pinned DESC, updated_at DESC';

    const notes = db.prepare(query).all(...params);
    res.json(notes);
  } catch (error) {
    console.error('Fetch notes error:', error);
    res.status(500).json({ error: 'Failed to retrieve notes.' });
  }
});

// GET single note
router.get('/:id', (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    const notes = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').all(noteId, userId);
    if (notes.length === 0) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    res.json(notes[0]);
  } catch (error) {
    console.error('Fetch note error:', error);
    res.status(500).json({ error: 'Failed to retrieve note.' });
  }
});

// CREATE note
router.post('/', (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content = '', category = 'General', color = '#ffffff', is_pinned = 0 } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Note title is required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO notes (user_id, title, content, category, color, is_pinned, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(userId, title.trim(), content, category.trim(), color, is_pinned ? 1 : 0);
    const newNoteId = Number(result.lastInsertRowid);

    const createdNote = db.prepare('SELECT * FROM notes WHERE id = ?').all(newNoteId)[0];
    res.status(201).json(createdNote);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note.' });
  }
});

// UPDATE note
router.put('/:id', (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;
    const { title, content, category, color, is_pinned } = req.body;

    // Check ownership
    const existing = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').all(noteId, userId);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Note not found or unauthorized.' });
    }

    const current = existing[0];
    const updatedTitle = title !== undefined ? title.trim() : current.title;
    const updatedContent = content !== undefined ? content : current.content;
    const updatedCategory = category !== undefined ? category.trim() : current.category;
    const updatedColor = color !== undefined ? color : current.color;
    const updatedPinned = is_pinned !== undefined ? (is_pinned ? 1 : 0) : current.is_pinned;

    if (!updatedTitle) {
      return res.status(400).json({ error: 'Note title cannot be empty.' });
    }

    const stmt = db.prepare(`
      UPDATE notes
      SET title = ?, content = ?, category = ?, color = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(updatedTitle, updatedContent, updatedCategory, updatedColor, updatedPinned, noteId, userId);

    const updatedNote = db.prepare('SELECT * FROM notes WHERE id = ?').all(noteId)[0];
    res.json(updatedNote);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note.' });
  }
});

// TOGGLE PIN
router.patch('/:id/pin', (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    const existing = db.prepare('SELECT is_pinned FROM notes WHERE id = ? AND user_id = ?').all(noteId, userId);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    const newPinned = existing[0].is_pinned ? 0 : 1;
    db.prepare('UPDATE notes SET is_pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?').run(newPinned, noteId, userId);

    const updatedNote = db.prepare('SELECT * FROM notes WHERE id = ?').all(noteId)[0];
    res.json(updatedNote);
  } catch (error) {
    console.error('Pin note error:', error);
    res.status(500).json({ error: 'Failed to toggle pin.' });
  }
});

// DELETE note
router.delete('/:id', (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    const result = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(noteId, userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Note not found or unauthorized.' });
    }

    res.json({ message: 'Note deleted successfully.' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note.' });
  }
});

module.exports = router;
