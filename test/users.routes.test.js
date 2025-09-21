/* eslint-env mocha */
const { expect } = require('chai');
const request = require('supertest');

let User;

describe('Users API', function () {
  before(function () {
    expect(global.__APP__).to.exist;
    User = require('../models/User');
  });

  beforeEach(async function () {
    await User.deleteMany({});
  });

  it('POST /api/users -> creates a user', async function () {
    const res = await request(global.__APP__)
      .post('/api/users')
      .send({ username: 'test', name: 'Test User', email: 't@e.com' });

    expect(res.status).to.equal(201);
    expect(res.body).to.include({ username: 'test', name: 'Test User' });
  });

  it('GET /api/users -> list', async function () {
    await User.create({ username: 'a', name: 'A' });
    const res = await request(global.__APP__).get('/api/users');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').with.length(1);
  });

  it('PUT /api/users/:id -> update', async function () {
    const u = await User.create({ username: 'a', name: 'A' });
    const res = await request(global.__APP__)
      .put(`/api/users/${u._id}`)
      .send({ name: 'A+' });

    expect(res.status).to.equal(200);
    expect(res.body.name).to.equal('A+');
  });

  it('DELETE /api/users/:id -> remove', async function () {
    const u = await User.create({ username: 'a', name: 'A' });
    const res = await request(global.__APP__).delete(`/api/users/${u._id}`);
    expect(res.status).to.equal(200);
    const check = await User.findById(u._id);
    expect(check).to.be.null;
  });
});
