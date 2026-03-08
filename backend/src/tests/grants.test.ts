import request from 'supertest';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from '../app.js'; // I'll need to create this

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../../database.db');

describe('GET /api/grants', () => {
  let db: any;

  beforeAll(() => {
    db = new Database(DB_PATH);
    // Clear and seed
    db.exec(`
      DELETE FROM saved_grants;
      DELETE FROM grants;
      INSERT INTO grants (title, category, deadline) VALUES ('Grant 1', 'Art', '2026-05-01');
      INSERT INTO grants (title, category, deadline) VALUES ('Grant 2', 'Science', '2026-04-01');
      INSERT INTO grants (title, category, deadline) VALUES ('Grant 3', 'Art', '2026-06-01');
    `);
  });

  afterAll(() => {
    db.close();
  });

  test('should return all grants', async () => {
    const response = await request(app).get('/api/grants');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
  });

  test('should filter by category', async () => {
    const response = await request(app).get('/api/grants?category=Art');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].category).toBe('Art');
  });

  test('should sort by deadline', async () => {
    const response = await request(app).get('/api/grants');
    expect(response.status).toBe(200);
    // Expected order: Grant 2 (April), Grant 1 (May), Grant 3 (June)
    expect(response.body[0].title).toBe('Grant 2');
    expect(response.body[1].title).toBe('Grant 1');
    expect(response.body[2].title).toBe('Grant 3');
  });
});
