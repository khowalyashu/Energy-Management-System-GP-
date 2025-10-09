// tests/helpers/db.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;

/**
 * Use one MongoMemoryServer instance for the whole run.
 */
beforeAll(async () => {
  jest.setTimeout(30000); // allow downloads/spawn on first run

  mongo = await MongoMemoryServer.create(); // can pin version with { binary: { version: '7.0.3' } }
  const uri = mongo.getUri();

  process.env.MONGODB_URI = uri;

  // connect mongoose
  await mongoose.connect(uri, { dbName: 'test' });
});

afterEach(async () => {
  // clear DB between tests
  const { collections } = mongoose.connection;
  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongo) await mongo.stop();
});
