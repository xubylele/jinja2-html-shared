module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'ts', 'json'],
  transformIgnorePatterns: ['/node_modules/'],
};
