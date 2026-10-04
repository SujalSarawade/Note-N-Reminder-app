const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET all reminders for user
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT r.*, n.title as note_title
      FROM reminders r
      LEFT JOIN notes n ON r.note_id = n.id
      WHERE r.user_id = ?
    `;
    const params = [userId];

    if (status === 'pending') {
      query += ' AND r.is_completed = 0';
    } else if (status === 'completed') {
      query += ' AND r.is_completed = 1';
    }

    query += ' ORDER BY r.is_completed ASC, r.due_date ASC';

    const reminders = db.prepare(query).all(...params);
    res.json(reminders);
  } catch (error) {
    console.error('Fetch reminders error:', error);
    res.status(500).json({ error: 'Failed to retrieve reminders.' });
  }
});

// CREATE reminder
router.post('/', (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description = '', due_date, priority = 'medium', note_id = null } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Reminder title is required.' });
    }

    if (!due_date) {
      return res.status(400).json({ error: 'Due date and time are required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO reminders (user_id, note_id, title, description, due_date, priority, is_completed)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);

    const result = stmt.run(userId, note_id || null, title.trim(), description.trim(), due_date, priority);
    const newId = Number(result.lastInsertRowid);

    const created = db.prepare(`
      SELECT r.*, n.title as note_title
      FROM reminders r
      LEFT JOIN notes n ON r.note_id = n.id
      WHERE r.id = ?
    `).all(newId)[0];

    res.status(201).json(created);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Failed to create reminder.' });
  }
});

// UPDATE reminder
router.put('/:id', (req, res) => {
  try {
    const reminderId = req.params.id;
    const userId = req.user.id;
    const { title, description, due_date, priority, is_completed, note_id } = req.body;

    const existing = db.prepare('SELECT * FROM reminders WHERE id = ? AND user_id = ?').all(reminderId, userId);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Reminder not found.' });
    }

    const current = existing[0];
    const uTitle = title !== undefined ? title.trim() : current.title;
    const uDesc = description !== undefined ? description.trim() : current.description;
    const uDueDate = due_date !== undefined ? due_date : current.due_date;
    const uPriority = priority !== undefined ? priority : current.priority;
    const uCompleted = is_completed !== undefined ? (is_completed ? 1 : 0) : current.is_completed;
    const uNoteId = note_id !== undefined ? (note_id || null) : current.note_id;

    const stmt = db.prepare(`
      UPDATE reminders
      SET title = ?, description = ?, due_date = ?, priority = ?, is_completed = ?, note_id = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(uTitle, uDesc, uDueDate, uPriority, uCompleted, uNoteId, reminderId, userId);

    const updated = db.prepare(`
      SELECT r.*, n.title as note_title
      FROM reminders r
      LEFT JOIN notes n ON r.note_id = n.id
      WHERE r.id = ?
    `).all(reminderId)[0];

    res.json(updated);
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ error: 'Failed to update reminder.' });
  }
});

// TOGGLE complete status
router.patch('/:id/toggle', (req, res) => {
  try {
    const reminderId = req.params.id;
    const userId = req.user.id;

    const existing = db.prepare('SELECT is_completed FROM reminders WHERE id = ? AND user_id = ?').all(reminderId, userId);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Reminder not found.' });
    }

    const newStatus = existing[0].is_completed ? 0 : 1;
    db.prepare('UPDATE reminders SET is_completed = ? WHERE id = ? AND user_id = ?').run(newStatus, reminderId, userId);

    const updated = db.prepare(`
      SELECT r.*, n.title as note_title
      FROM reminders r
      LEFT JOIN notes n ON r.note_id = n.id
      WHERE r.id = ?
    `).all(reminderId)[0];

    res.json(updated);
  } catch (error) {
    console.error('Toggle reminder error:', error);
    res.status(500).json({ error: 'Failed to toggle reminder status.' });
  }
});

// DELETE reminder
router.delete('/:id', (req, res) => {
  try {
    const reminderId = req.params.id;
    const userId = req.user.id;

    const result = db.prepare('DELETE FROM reminders WHERE id = ? AND user_id = ?').run(reminderId, userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Reminder not found.' });
    }

    res.json({ message: 'Reminder deleted successfully.' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Failed to delete reminder.' });
  }
});

module.exports = router;
