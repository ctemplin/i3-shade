module.exports = {
  testPathIgnorePatterns: ['/node_modules/'],
  testEnvironment: "jest-environment-node",
  globals: {
    "__SOCKET_PATH__": null,
    "__SERVER__": null
  },
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.js'],
}
