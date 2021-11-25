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
const commandNameFromCode = "COMMAND GET_WORKSPACES SUBSCRIBE GET_OUTPUTS GET_TREE GET_MARKS GET_BAR_CONFIG GET_VERSION GET_BINDING_MODES GET_CONFIG SEND_TICK SYNC".split(' ');
const commandCodeFromName = {};
commandNameFromCode.forEach(function(name, code) { commandCodeFromName[name] = code; });

const eventNameFromCode = "workspace output mode window barconfig_update binding shutdown tick".split(' ');
const eventCodeFromName = {};
eventNameFromCode.forEach(function(name, code) { eventCodeFromName[name] =  0x80000000 + code; });
//#endregion

function I3MockServer(socketPath, handleMessage) {
  this.i3ipc = require('net').createServer({}, (conn) => {
    this._stream = conn
    this._waitHeader = true
    //#region Adapted from https://github.com/sidorares/node-i3/blob/2cee4237e1ade8f911ee2cd4ab4e1a0a382bd958/lib/ipc.js#L74
    this._stream.on('readable', () => {
      while(1) {
        if (this._waitHeader) {
          var header = this._stream.read(I3_MESSAGE_HEADER_LENGTH);
          if (header) {
            this._message = new I3Message(header);
            if (this._message.payloadLength == 0) {
              handleMessage(this._message)
            } else {
              this._waitHeader = false;
            }
          } else break;
        }
        else {
          var data = this._stream.read(this._message.payloadLength);
          if (data) {
            this._message.payload = data;
            handleMessage(this._message)
            this._waitHeader = true;
          } else break;
        }
      }
    })
    //#endregion
  }).listen(socketPath)

  this.close = function() {
    this.i3ipc.close()
  }
}

module.exports = { I3MockServer, encodeCommand, commandNameFromCode, commandCodeFromName, eventCodeFromName }
