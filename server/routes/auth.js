const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if username or email already exists
    const existing = db.prepare('SELECT id, username, email FROM users WHERE username = ? OR email = ?').all(username.trim(), email.trim().toLowerCase());
    if (existing.length > 0) {
      if (existing.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
        return res.status(409).json({ error: 'Username is already taken.' });
      }
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const insertStmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    const result = insertStmt.run(username.trim(), email.trim().toLowerCase(), hashedPassword);

    const userId = Number(result.lastInsertRowid);

    // Generate JWT
    const token = jwt.sign({ id: userId, username: username.trim(), email: email.trim().toLowerCase() }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: userId,
        username: username.trim(),
        email: email.trim().toLowerCase()
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/username and password are required.' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    // Search by username or email
    const users = db.prepare('SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?').all(cleanIdentifier, cleanIdentifier);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Current user profile + stats
router.get('/me', authMiddleware, (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').all(req.user.id);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = users[0];
    const notesCount = db.prepare('SELECT COUNT(*) as count FROM notes WHERE user_id = ?').all(req.user.id)[0].count;
    const remindersCount = db.prepare('SELECT COUNT(*) as count FROM reminders WHERE user_id = ? AND is_completed = 0').all(req.user.id)[0].count;

    res.json({
      user,
      stats: {
        totalNotes: Number(notesCount),
        pendingReminders: Number(remindersCount)
      }
    });
  } catch (error) {
    console.error('Fetch me error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

module.exports = router;
