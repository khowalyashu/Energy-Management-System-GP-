/* eslint-env mocha */
const { expect } = require('chai');
const request = require('supertest');

let Report;

describe('Reports API', function () {
  before(function () {
    expect(global.__APP__).to.exist;
    Report = require('../models/Report');
  });

  beforeEach(async function () {
    await Report.deleteMany({});
  });

  it('POST /api/reports/generate -> returns new report', async function () {
    const res = await request(global.__APP__)
      .post('/api/reports/generate')
      .send({ type: 'daily' });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('_id');
    expect(res.body).to.have.property('type', 'daily');
  });

  it('GET /api/reports -> returns array (after generate)', async function () {
    await request(global.__APP__).post('/api/reports/generate').send({ type: 'weekly' });
    const res = await request(global.__APP__).get('/api/reports');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').with.length(1);
  });
});
