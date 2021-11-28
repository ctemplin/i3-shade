const { globals } = require('../jest.config');
const path = require('path');
const { I3MockServer } = require('../tests/lib/i3MockServer')
const { handleMessage } = require('../tests/lib/i3Handlers')

var server

// Establish API mocking before all tests.
beforeAll(() => {
  var spath = path.join(process.cwd(), 'tests', 'i3-shade.sock')
  globals.__SOCKET_PATH__ = spath
  server = new I3MockServer(spath, handleMessage)
  globals.__I3_MOCK_SERVER__ = server
})

afterAll(() => {
  server.close()
})

