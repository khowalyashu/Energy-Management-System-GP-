// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/db.js'],
  moduleNameMapper: {
    '^/models/(.*)$': '<rootDir>/models/$1',
    '^/routes/(.*)$': '<rootDir>/routes/$1',
    '^/config/(.*)$': '<rootDir>/config/$1',
    '^/server$': '<rootDir>/server.js',
  },
  testTimeout: 30000,
  // optional: verbose: true,
};
