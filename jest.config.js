module.exports = {
  testPathIgnorePatterns: ['/node_modules/'],
  testEnvironment: "jest-environment-node",
  globals: {
    "__SOCKET_PATH__": null,
    "__EXEMPT_COM__": "nop i3-shade-exempt"
  },
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.js'],
}
