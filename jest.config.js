module.exports = {
  testPathIgnorePatterns: ['/node_modules/'],
  testEnvironment: "jest-environment-node",
  clearMocks: true,
  globals: {
    "__SOCKET_PATH__": null,
    "__SHADE_PREF__": "shade-jest",
    "__SHADE_EXEMPT__": "shade-jest-exempt",
    "__EXEMPT_COM__": "nop i3-shade-exempt"
  },
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.js'],
}
