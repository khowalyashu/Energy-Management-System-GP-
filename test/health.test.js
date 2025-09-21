/* eslint-env mocha */
const { expect } = require('chai');
const request = require('supertest');

describe('Health', () => {
  it('GET /api/health -> 200', async () => {
    // __APP__ is set in test/bootstrap.js
    const res = await request(global.__APP__).get('/api/health');
    expect(res.status).to.equal(200);
    // your endpoint may return {ok:true} or {status:'OK'}
    expect(res.body).to.be.an('object');
  });
});
