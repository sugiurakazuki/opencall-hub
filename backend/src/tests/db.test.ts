import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../database.db');

describe('Database Schema', () => {
  let db: any;

  beforeAll(() => {
    // Ensure the db exists
    if (!fs.existsSync(DB_PATH)) {
      throw new Error(`Database file not found at ${DB_PATH}. Run init-db first.`);
    }
    db = new Database(DB_PATH);
  });

  afterAll(() => {
    if (db) db.close();
  });

  test('should have a grants table', () => {
    const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='grants'").get();
    expect(table).toBeDefined();
    expect(table.name).toBe('grants');
  });

  test('should have a users table', () => {
    const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    expect(table).toBeDefined();
    expect(table.name).toBe('users');
  });

  test('should have a saved_grants table', () => {
    const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='saved_grants'").get();
    expect(table).toBeDefined();
    expect(table.name).toBe('saved_grants');
  });
});
