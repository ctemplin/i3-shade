const { globals } = require('../jest.config');
const path = require('path');
const { I3MockServer, encodeCommand, commandNameFromCode, commandCodeFromName, eventCodeFromName } = require('../tests/lib/i3MockServer')

var server

// Establish API mocking before all tests.
beforeAll(() => {
  var spath = path.join(process.cwd(), 'tests', 'i3-shade.sock')
  globals.__SOCKET_PATH__ = spath
  server = new I3MockServer(spath, handleMessage)
})

afterAll(() => {
  server.close()
})

function handleMessage(message) {
  let comCode = message.code
  let payload = message.payload?.toString()
  let resp
  switch(commandNameFromCode[comCode]) {
    case 'GET_WORKSPACES':
      resp = require('../tests/data-mocks/cm_workspaces_initial.json')
      server._stream.write(encodeCommand(comCode, JSON.stringify(resp)))
      break;
    case 'GET_TREE':
      resp = require('../tests/data-mocks/cm_tree.json')
      server._stream.write(encodeCommand(comCode, JSON.stringify(resp)))
      break;
    case 'COMMAND':
      if (payload == globals.__EXEMPT_COM__) {
        resp = require('../tests/data-mocks/ev_binding_shade-exempt.json')
        server._stream.write(encodeCommand(eventCodeFromName['binding'], JSON.stringify(resp)))
      }
      let payloadSegs = payload.split(' ')
      if (payloadSegs[0] == 'workspace') {
        var wsNum = Number(payloadSegs.pop())
        resp = require('../tests/data-mocks/ev_workspace_focus.json')
        resp.current.num = wsNum
        server._stream.write(encodeCommand(eventCodeFromName['workspace'], JSON.stringify(resp)))
      }
      if (payload == "focus mode_toggle") {
        resp = require('../tests/data-mocks/ev_window_focus.json')
        server._stream.write(encodeCommand(eventCodeFromName['window'], JSON.stringify(resp)))
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
