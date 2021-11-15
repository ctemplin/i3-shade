module.exports = {
  testPathIgnorePatterns: ['/node_modules/'],
  testEnvironment: "jest-environment-node",
  globals: {
    "__SOCKET_PATH__": null,
  },
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.js'],
}
