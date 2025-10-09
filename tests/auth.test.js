const request = require('supertest');
const { app } = require('../server');
const { seedUsers } = require('./helpers/seed');

describe('Auth', () => {
  beforeAll(async () => {
    await seedUsers();
  });

  test('login returns JWT for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password' });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toBeTruthy();
    expect(res.body).toHaveProperty('token');

    if (res.body.user) {
      expect(res.body.user).toMatchObject({ username: 'admin' });
    }
  });

  test('login fails for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'nope' });

    expect([400, 401]).toContain(res.status);
  });
});
