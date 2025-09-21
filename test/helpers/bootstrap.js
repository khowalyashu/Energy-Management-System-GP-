// test/bootstrap.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongo;

before(async function () {
  this.timeout(30000);

  // Start temporary MongoDB
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  // Use in-memory DB for the app & tests
  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = 'test';
  process.env.AUTH_DEV_BYPASS = 'true';

  // Connect mongoose 
  await mongoose.connect(uri);

  // Load the app AFTER env is set so it uses the memory DB
  const app = require('../server');
  global.__APP__ = app;
});

after(async () => {
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
});
