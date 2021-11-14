const { globals } = require('../jest.config');
const path = require('path')

var server

// Establish API mocking before all tests.
beforeAll(() => {
  const net = require('net')
  server = net.createServer({pauseOnConnect: true});
  globals.__SOCKET_PATH__ = path.join(process.cwd(), 'tests', 'i3-shade.socket')
  server.listen(
    globals.__SOCKET_PATH__ 
  )
})

// Clean up after the tests are finished.
afterAll(() => server.close())
