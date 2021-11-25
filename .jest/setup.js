const { globals } = require('../jest.config');
const path = require('path');
const { I3MockServer, encodeCommand, commandNameFromCode, commandCodeFromName, eventCodeFromName } = require('../tests/lib/i3MockServer')

var server

// Establish API mocking before all tests.
beforeAll(() => {
  var spath = path.join(process.cwd(), 'tests', 'i3-shade.sock')
  globals.__SOCKET_PATH__ = spath

  server = new I3MockServer(handleMessage)
  // code 0
  server.i3ipc.on('workspace', (wsNum) => {
    var payload = require('../tests/data-mocks/ev_workspace_focus.json')
    payload.current.num = wsNum
    server._stream.write(encodeCommand(eventCodeFromName['workspace'], JSON.stringify(payload)))
  })

  // code 5
  server.i3ipc.on('binding', () => {
    var payload = require('../tests/data-mocks/ev_binding_shade-exempt.json')
    server._stream.write(encodeCommand(eventCodeFromName['binding'], JSON.stringify(payload)))
  })

  // code 3
  server.i3ipc.on('window', () => {
    var payload = require('../tests/data-mocks/ev_window_focus.json')
    server._stream.write(encodeCommand(eventCodeFromName['window'], JSON.stringify(payload)))
  })
})

afterAll(() => {
  server.close()
})

function handleMessage(message) {
  let comCode = message.code
  payload = message.payload?.toString()
  switch(commandNameFromCode[comCode]) {
    case 'GET_WORKSPACES':
      payload = require('../tests/data-mocks/cm_workspaces_initial.json')
      server._stream.write(encodeCommand(comCode, JSON.stringify(payload)))
      break;
    case 'GET_TREE':
      payload = require('../tests/data-mocks/cm_tree.json')
      server._stream.write(encodeCommand(comCode, JSON.stringify(payload)))
      break;
    case 'COMMAND':
      if (payload == globals.__EXEMPT_COM__) {
        server.i3ipc.emit('binding')
      }
      let payloadSegs = payload.split(' ')
      if (payloadSegs[0] == 'workspace') {
        var wsNum = Number(payloadSegs.pop())
        server.i3ipc.emit('workspace', wsNum)
      }
      if (payload == "focus mode_toggle") {
        server.i3ipc.emit('window', payload)
      }
      if (payloadSegs[1] == "mark") {

      }
      server._stream.write(
        encodeCommand(
          commandCodeFromName['COMMAND'],
          '[{"success": true}]'
        )
      )
      break;
    case 'SUBSCRIBE':
      server._stream.write(
        encodeCommand(
          commandCodeFromName['SUBSCRIBE'],
          '[{"success": true}]'
        )
      )
      break;
  }
}
