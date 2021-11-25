const { globals } = require('../../jest.config');

//#region Adapted from https://github.com/sidorares/node-i3/blob/2cee4237e1ade8f911ee2cd4ab4e1a0a382bd958/lib/ipc.js#L7
const I3_MAGIC = new Buffer.from('i3-ipc');
var I3_MESSAGE_HEADER_LENGTH = I3_MAGIC.length + 8;
//#endregion

//#region Adapted from https://github.com/sidorares/node-i3/blob/2cee4237e1ade8f911ee2cd4ab4e1a0a382bd958/lib/ipc.js#L46
function encodeCommand(code, payload) {
  if (!payload)
    payload = '';
  var payloadOffset = I3_MAGIC.length + 8;
  var buf = new Buffer.alloc(payloadOffset + payload.length);
  I3_MAGIC.copy(buf);
  buf.writeUInt32LE(payload.length, 6);
  buf.writeUInt32LE(code, 10);
  if (payload.length > 0) {
    buf.write(payload, payloadOffset);
  }
  return buf;
}
//#endregion

//#region Apapted from https://github.com/sidorares/node-i3/blob/2cee4237e1ade8f911ee2cd4ab4e1a0a382bd958/lib/ipc.js#L38
function I3Message(buff) {
  this.magic = buff.slice(0, I3_MAGIC.length);
  this.payloadLength = buff.readUInt32LE(I3_MAGIC.length);
  this.code = buff.readUInt16LE(I3_MAGIC.length + 4);
  this.payload = null;
  this.isEvent = (buff.readUInt8(I3_MAGIC.length + 7) & 0x80) == 0x80;
}
//#endregion

//#region Adapted from https://github.com/sidorares/node-i3/blob/2cee4237e1ade8f911ee2cd4ab4e1a0a382bd958/lib/ipc.js#L124
var commandNameFromCode = "COMMAND GET_WORKSPACES SUBSCRIBE GET_OUTPUTS GET_TREE GET_MARKS GET_BAR_CONFIG GET_VERSION GET_BINDING_MODES GET_CONFIG SEND_TICK SYNC".split(' ');
var commandCodeFromName = {};
commandNameFromCode.forEach(function(name, code) { commandCodeFromName[name] = code; });

var eventNameFromCode = "workspace output mode window barconfig_update binding shutdown tick".split(' ');
var eventCodeFromName = {};
eventNameFromCode.forEach(function(name, code) { eventCodeFromName[name] = code; });
//#endregion

function I3MockServer() {
  var self = this
  this.server = require('net').createServer({}, (conn) => {
    self._stream = conn
    self._waitHeader = true
    //#region Adapted from https://github.com/sidorares/node-i3/blob/2cee4237e1ade8f911ee2cd4ab4e1a0a382bd958/lib/ipc.js#L74
    self._stream.on('readable', () => {
      while(1) {
        if (self._waitHeader) {
          var header = self._stream.read(I3_MESSAGE_HEADER_LENGTH);
          if (header) {
            self._message = new I3Message(header);
            if (self._message.payloadLength == 0) {
              //#region Here i3/lib/ipc.js calls self._handleMessage();
              let payload
              switch(self._message.code) {
                case 1: // GET_WORKSPACES
                  payload = require('../data-mocks/cm_workspaces_initial.json')
                  self._stream.write(encodeCommand(1, JSON.stringify(payload)))
                  break;
                case 4: // GET_TREE
                  payload = require('../data-mocks/cm_tree.json')
                  self._stream.write(encodeCommand(4, JSON.stringify(payload)))
                  break;
              }
              //#endregion
            } else {
              self._waitHeader = false;
            }
          } else break;
        }
        else {
          var data = self._stream.read(self._message.payloadLength);
          if (data) {
            self._message.payload = data;
            //#region Here i3/lib/ipc.js calls self._handleMessage();
            let payload = self._message.payload.toString()
            switch(self._message.code) {
              case 0: // COMMAND
                if (payload == globals.__EXEMPT_COM__) {
                  self.server.emit('binding')
                }
                let payloadSegs = payload.split(' ')
                if (payloadSegs[0] == 'workspace') {
                  var wsNum = Number(payloadSegs.pop())
                  self.server.emit('workspace', wsNum)
                }
                if (payload == "focus mode_toggle") {
                  self.server.emit('window', payload)
                }
                if (payloadSegs[1] == "mark") {

                }
                self._stream.write(encodeCommand(0, '[{"success": true}]'))
                break;
              case 2: // SUBSCRIBE
                self._stream.write(encodeCommand(2, '[{"success": true}]'))
                break;
            }
            //#endregion
            self._waitHeader = true;
          } else break;
        }
      }
    })
    //#endregion
  }).listen(globals.__SOCKET_PATH__);

  // code 0
  this.server.on('workspace', (wsNum) => {
    var payload = require('../data-mocks/ev_workspace_focus.json')
    payload.current.num = wsNum
    this._stream.write(encodeCommand((0x080000000), JSON.stringify(payload)))
  })

  // code 5
  this.server.on('binding', () => {
    var payload = require('../data-mocks/ev_binding_shade-exempt.json')
    this._stream.write(encodeCommand((0x080000005), JSON.stringify(payload)))
  })

  // code 3
  this.server.on('window', () => {
    var payload = require('../data-mocks/ev_window_focus.json')
    this._stream.write(encodeCommand((0x080000003), JSON.stringify(payload)))
  })

  this.close = function() {
    this.server.close()
  }
}

module.exports = { I3MockServer, encodeCommand }
