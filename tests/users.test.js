const request = require('supertest');
const { app } = require('../server');
const { seedUsers } = require('./helpers/seed');

describe('Users', () => {
  beforeAll(async () => {
    await seedUsers();
  });

  test('GET /api/users returns array', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/users creates user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Test U', username: 'testu', email: 'test@myems.com', role: 'user' });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('username', 'testu');
  });
});
