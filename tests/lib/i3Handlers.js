const { globals } = require('../../jest.config.js')
const { encodeCommand, commandNameFromCode, commandCodeFromName, eventCodeFromName } = require('./i3MockServer')

function handleMessage(server) {
  let comCode = server._message.code
  let payload = server._message.payload?.toString()
  let resp
  switch(commandNameFromCode[comCode]) {
    case 'GET_WORKSPACES':
      resp = server.responses.workspaces
      server._stream.write(encodeCommand(comCode, JSON.stringify(resp)))
      break;
    case 'GET_TREE':
      resp = server.responses.tree
      server._stream.write(encodeCommand(comCode, JSON.stringify(resp)))
      break;
    case 'COMMAND':
      if (payload == globals.__EXEMPT_COM__) {
        resp = server.responses.exempt
        server._stream.write(encodeCommand(eventCodeFromName['binding'], JSON.stringify(resp)))
      }
      let payloadSegs = payload.split(' ')
      if (payloadSegs[0] == 'workspace') {
        resp = server.responses.workspace
        server._stream.write(encodeCommand(eventCodeFromName['workspace'], JSON.stringify(resp)))
      }
      if (payload == "focus tiling") {
        resp = server.responses.focus
        server._stream.write(encodeCommand(eventCodeFromName['window'], JSON.stringify(resp)))
      }
      if (payload == "focus floating") {
        resp = server.responses.focus
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