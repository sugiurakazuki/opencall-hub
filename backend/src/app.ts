import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../database.db');

export const app = express();
app.use(express.json());

app.get('/api/grants', (req, res) => {
  const db = new Database(DB_PATH);
  const { category } = req.query;

  let query = "SELECT * FROM grants";
  const params: any[] = [];

  if (category) {
    query += " WHERE category = ?";
    params.push(category);
  }

  // Sort by deadline by default
  query += " ORDER BY deadline ASC";

  const grants = db.prepare(query).all(...params);
  db.close();

  res.json(grants);
});

app.post('/api/users/saved-grants', (req, res) => {
  const { user_id, grant_id } = req.body;

  if (!user_id || !grant_id) {
    res.status(400).json({ error: 'user_id and grant_id are required' });
    return;
  }

  const db = new Database(DB_PATH);
  try {
    db.prepare("INSERT INTO saved_grants (user_id, grant_id) VALUES (?, ?)").run(user_id, grant_id);
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
