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
