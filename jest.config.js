module.exports = {
  testPathIgnorePatterns: ['/node_modules/'],
  testEnvironment: "jest-environment-node",
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.js'],
}
