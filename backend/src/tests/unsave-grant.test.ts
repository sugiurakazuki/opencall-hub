import request from 'supertest';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from '../app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../../database.db');

describe('DELETE /api/users/:id/saved-grants/:grant_id', () => {
  let db: any;

  beforeAll(() => {
    db = new Database(DB_PATH);
    db.exec(`
      DELETE FROM saved_grants;
      DELETE FROM users;
      DELETE FROM grants;
      INSERT INTO users (id, username, email) VALUES (1, 'testuser', 'test@example.com');
      INSERT INTO grants (id, title, category, deadline) VALUES (1, 'Grant 1', 'Art', '2026-05-01');
      INSERT INTO saved_grants (user_id, grant_id) VALUES (1, 1);
    `);
  });

  afterAll(() => {
    db.close();
  });

  test('should unsave a grant for a user', async () => {
    const response = await request(app).delete('/api/users/1/saved-grants/1');
    expect(response.status).toBe(200);
    
    const saved = db.prepare("SELECT * FROM saved_grants WHERE user_id = 1 AND grant_id = 1").get();
    expect(saved).toBeUndefined();
  });

  test('should return 404 if user or grant does not exist', async () => {
    const response = await request(app).delete('/api/users/999/saved-grants/1');
    expect(response.status).toBe(404);
  });
});
