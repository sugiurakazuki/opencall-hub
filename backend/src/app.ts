import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../database.db');

export const app = express();
app.use(express.json());

// Allow frontend dev server to call this API from a different origin.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.get('/api/grants', (req, res) => {
  const db = new Database(DB_PATH);
  try {
    const { category, user_id } = req.query;

    let query = `
      SELECT g.*, 
      CASE WHEN sg.user_id IS NOT NULL THEN 1 ELSE 0 END as is_saved
      FROM grants g
      LEFT JOIN saved_grants sg ON g.id = sg.grant_id AND sg.user_id = ?
    `;
    const params: any[] = [user_id || null];

    if (category) {
      query += ' WHERE g.category = ?';
      params.push(category);
    }

    // Sort by deadline by default
    query += ' ORDER BY g.deadline ASC';

    const grants = db.prepare(query).all(...params);
    res.json(grants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch grants' });
  } finally {
    db.close();
  }
});

app.post('/api/users/saved-grants', (req, res) => {
  const { user_id, grant_id } = req.body;

  if (!user_id || !grant_id) {
    res.status(400).json({ error: 'user_id and grant_id are required' });
    return;
  }

  const db = new Database(DB_PATH);
  try {
    db.prepare('INSERT INTO saved_grants (user_id, grant_id) VALUES (?, ?)').run(user_id, grant_id);
    res.status(201).json({ message: 'Grant saved successfully' });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
      res.status(409).json({ error: 'Grant already saved' });
    } else {
      res.status(500).json({ error: 'Failed to save grant' });
    }
  } finally {
    db.close();
  }
});

app.get('/api/users/:id/saved-grants', (req, res) => {
  const { id } = req.params;
  const db = new Database(DB_PATH);

  try {
    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const query = `
      SELECT g.* FROM grants g
      JOIN saved_grants sg ON g.id = grant_id
      WHERE sg.user_id = ?
      ORDER BY g.deadline ASC
    `;
    const savedGrants = db.prepare(query).all(id);
    res.json(savedGrants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved grants' });
  } finally {
    db.close();
  }
});

app.delete('/api/users/:id/saved-grants/:grant_id', (req, res) => {
  const { id, grant_id } = req.params;
  const db = new Database(DB_PATH);

  try {
    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    db.prepare('DELETE FROM saved_grants WHERE user_id = ? AND grant_id = ?').run(id, grant_id);
    res.json({ message: 'Grant unsaved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unsave grant' });
  } finally {
    db.close();
  }
});
