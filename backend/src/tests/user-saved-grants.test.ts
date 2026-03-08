import request from 'supertest';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from '../app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../../database.db');

describe('GET /api/users/:id/saved-grants', () => {
  let db: any;

  beforeAll(() => {
    db = new Database(DB_PATH);
    db.exec(`
      DELETE FROM saved_grants;
      DELETE FROM users;
      DELETE FROM grants;
      INSERT INTO users (id, username, email) VALUES (1, 'testuser', 'test@example.com');
      INSERT INTO grants (id, title, category, deadline) VALUES (1, 'Grant 1', 'Art', '2026-05-01');
      INSERT INTO grants (id, title, category, deadline) VALUES (2, 'Grant 2', 'Science', '2026-04-01');
      INSERT INTO saved_grants (user_id, grant_id) VALUES (1, 1);
    `);
  });

  afterAll(() => {
    db.close();
  });

  test('should return saved grants for a user', async () => {
    const response = await request(app).get('/api/users/1/saved-grants');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Grant 1');
  });

  test('should return 404 if user does not exist', async () => {
    const response = await request(app).get('/api/users/999/saved-grants');
    expect(response.status).toBe(404);
  });
});
