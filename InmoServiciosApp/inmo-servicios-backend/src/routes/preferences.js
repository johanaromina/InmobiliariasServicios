const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Ensure table exists (lightweight migration)
const ensureTable = async () => {
  await db.execute(`CREATE TABLE IF NOT EXISTS usuarios_preferencias (
    usuario_id INT PRIMARY KEY,
    preferencias JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )`);
};

ensureTable().catch((e) => console.error('Error ensuring usuarios_preferencias:', e.message));

const defaultPrefs = {
  theme: 'light',
  primaryColor: '#B85C1B',
  fontScale: 1,
  reducedMotion: false,
  notifications: true,
  language: 'es',
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.execute('SELECT preferencias FROM usuarios_preferencias WHERE usuario_id = ?', [userId]);
    if (rows.length === 0) {
      return res.json({ preferences: defaultPrefs });
    }
    const prefs = rows[0].preferencias || {};
    res.json({ preferences: { ...defaultPrefs, ...prefs } });
  } catch (e) {
    console.error('GET /preferences error', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const prefs = { ...defaultPrefs, ...(req.body || {}) };
    await db.execute(
      'INSERT INTO usuarios_preferencias (usuario_id, preferencias) VALUES (?, ?) ON DUPLICATE KEY UPDATE preferencias = VALUES(preferencias) ',
      [userId, JSON.stringify(prefs)]
    );
    res.json({ message: 'Preferences saved', preferences: prefs });
  } catch (e) {
    console.error('PUT /preferences error', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

