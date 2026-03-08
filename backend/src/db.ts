import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../database.db');

export function initDb() {
  const db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS grants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      deadline TEXT,
      region TEXT,
      url TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS saved_grants (
      user_id INTEGER,
      grant_id INTEGER,
      PRIMARY KEY (user_id, grant_id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (grant_id) REFERENCES grants (id)
    );
  `);

  console.log('Database initialized successfully.');
  db.close();
}

// Check if this script is being run directly
if (process.argv[1] === __filename) {
  initDb();
}
