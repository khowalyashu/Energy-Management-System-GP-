const request = require('supertest');
const { app } = require('../server');
const { seedUsers, seedDevices } = require('./helpers/seed');

describe('Devices CRUD', () => {
  let owner;

  beforeAll(async () => {
    const [admin] = await seedUsers();
    owner = admin._id;
  });

  // DB is cleared in afterEach (helpers/db.js), so reseed here
  beforeEach(async () => {
    await seedDevices(owner);
  });

  test('GET /api/devices returns list', async () => {
    const res = await request(app).get('/api/devices');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('POST /api/devices creates device', async () => {
    const payload = {
      name: 'Test Lamp',
      type: 'lighting',
      powerRating: 60,
      location: 'Lab A',
      status: 'active',
      userId: String(owner),
    };
    const res = await request(app).post('/api/devices').send(payload);
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name', 'Test Lamp');
  });

  test('PUT /api/devices/:id updates device', async () => {
    const list = await request(app).get('/api/devices');
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);

    const id = list.body[0]._id;
    const res = await request(app).put(`/api/devices/${id}`).send({ location: 'Room 42' });
    expect([200, 204]).toContain(res.status);
  });

  test('DELETE /api/devices/:id removes device', async () => {
    const created = await request(app).post('/api/devices').send({
      name: 'Temp Device',
      type: 'electronics',
      powerRating: 10,
      location: 'Temp',
      status: 'inactive',
      userId: String(owner),
    });
    const id = created.body._id;
    const res = await request(app).delete(`/api/devices/${id}`);
    expect([200, 204]).toContain(res.status);
  });
});
