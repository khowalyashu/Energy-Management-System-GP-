const request = require('supertest');
const { app } = require('../server');
const { seedUsers, seedReports } = require('./helpers/seed');

describe('Reports', () => {
  beforeAll(async () => {
    await seedUsers();
    await seedReports(); // seeds daily + monthly with required `period`
  });

  test('GET /api/reports returns reports', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/reports/generate daily', async () => {
    const res = await request(app)
      .post('/api/reports/generate')
      .send({ type: 'daily' });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('type', 'daily');
  });

  test('POST /api/reports/generate monthly', async () => {
    const res = await request(app)
      .post('/api/reports/generate')
      .send({ type: 'monthly' }); // <- supported enum type
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('type', 'monthly');
  });

});
