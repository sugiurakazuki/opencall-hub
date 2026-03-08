import request from 'supertest';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from '../app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../../database.db');

describe('POST /api/users/saved-grants', () => {
  let db: any;

  beforeAll(() => {
    db = new Database(DB_PATH);
    db.exec(`
      DELETE FROM saved_grants;
      DELETE FROM users;
      DELETE FROM grants;
      INSERT INTO users (id, username, email) VALUES (1, 'testuser', 'test@example.com');
      INSERT INTO grants (id, title, category, deadline) VALUES (1, 'Grant 1', 'Art', '2026-05-01');
    `);
  });

  afterAll(() => {
    db.close();
  });

  test('should save a grant for a user', async () => {
    const response = await request(app)
      .post('/api/users/saved-grants')
      .send({ user_id: 1, grant_id: 1 });
    
    expect(response.status).toBe(201);
    
    const saved = db.prepare("SELECT * FROM saved_grants WHERE user_id = 1 AND grant_id = 1").get();
    expect(saved).toBeDefined();
  });

  test('should return 409 if grant is already saved', async () => {
    // First save
    await request(app)
      .post('/api/users/saved-grants')
      .send({ user_id: 1, grant_id: 1 });
    
    // Duplicate save
    const response = await request(app)
      .post('/api/users/saved-grants')
      .send({ user_id: 1, grant_id: 1 });
    
    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Grant already saved');
  });

  test('should return 400 if user_id or grant_id is missing', async () => {
    const response = await request(app)
      .post('/api/users/saved-grants')
      .send({ user_id: 1 });
    
    expect(response.status).toBe(400);
  });
});
