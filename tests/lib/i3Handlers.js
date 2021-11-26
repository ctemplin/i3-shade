const { globals } = require('../../jest.config.js')
const { encodeCommand, commandNameFromCode, commandCodeFromName, eventCodeFromName } = require('./i3MockServer')

function handleMessage(server) {
  let comCode = server._message.code
  let payload = server._message.payload?.toString()
  let resp
  switch(commandNameFromCode[comCode]) {
    case 'GET_WORKSPACES':
      resp = require('../data-mocks/cm_workspaces_initial.json')
      server._stream.write(encodeCommand(comCode, JSON.stringify(resp)))
      break;
    case 'GET_TREE':
      resp = require('../data-mocks/cm_tree.json')
      server._stream.write(encodeCommand(comCode, JSON.stringify(resp)))
      break;
    case 'COMMAND':
      if (payload == globals.__EXEMPT_COM__) {
        resp = require('../data-mocks/ev_binding_shade-exempt.json')
        resp.binding.command = globals.__EXEMPT_COM__
        server._stream.write(encodeCommand(eventCodeFromName['binding'], JSON.stringify(resp)))
      }
      let payloadSegs = payload.split(' ')
      if (payloadSegs[0] == 'workspace') {
        var wsNum = Number(payloadSegs.pop())
        resp = require('../data-mocks/ev_workspace_focus.json')
        resp.current.num = wsNum
        server._stream.write(encodeCommand(eventCodeFromName['workspace'], JSON.stringify(resp)))
      }
      if (payload == "focus tiling") {
        resp = require('../data-mocks/ev_window_focus.json')
        server._stream.write(encodeCommand(eventCodeFromName['window'], JSON.stringify(resp)))
      }
      if (payload == "focus floating") {
        resp = require('../data-mocks/ev_window_focus.json')
        resp.container.floating = "user_on"
        resp.container.marks = [globals.__SHADE_PREF__ + "_1_1_999"]
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

module.exports = { handleMessage }