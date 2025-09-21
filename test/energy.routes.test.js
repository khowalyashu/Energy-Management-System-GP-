/* eslint-env mocha */
const { expect } = require('chai');
const request = require('supertest');

let Device;

describe('Devices API', function () {
  before(function () {
    // app is set in test/bootstrap.js
    expect(global.__APP__).to.exist;
    Device = require('../models/Device'); 
  });

  beforeEach(async function () {
    await Device.deleteMany({});
  });

  it('POST /api/devices -> creates a device', async function () {
    const payload = {
      name: 'Test Lamp',
      type: 'lighting',
      powerRating: 60,
      status: 'active',
      location: 'Bedroom'
    };

    const res = await request(global.__APP__).post('/api/devices').send(payload);
    expect(res.status).to.equal(201);
    expect(res.body).to.include({ name: 'Test Lamp', type: 'lighting' });
    expect(res.body).to.have.property('_id');
  });

  it('GET /api/devices -> returns array', async function () {
    await Device.create({ name: 'A', type: 'lighting' });
    const res = await request(global.__APP__).get('/api/devices');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').with.length(1);
  });

  it('PUT /api/devices/:id -> updates device', async function () {
    const d = await Device.create({ name: 'A', type: 'lighting' });
    const res = await request(global.__APP__)
      .put(`/api/devices/${d._id}`)
      .send({ name: 'A+', powerRating: 75 });

    expect(res.status).to.equal(200);
    expect(res.body).to.include({ name: 'A+' });
    expect(res.body.powerRating).to.equal(75);
  });

  it('DELETE /api/devices/:id -> removes device', async function () {
    const d = await Device.create({ name: 'A', type: 'lighting' });
    const res = await request(global.__APP__).delete(`/api/devices/${d._id}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('ok', true);

    const check = await Device.findById(d._id);
    expect(check).to.be.null;
  });
});
