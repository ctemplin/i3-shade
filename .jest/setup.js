const { globals } = require('../jest.config');
const path = require('path');

var server
const I3_MAGIC = new Buffer.from('i3-ipc');
var I3_MESSAGE_HEADER_LENGTH = I3_MAGIC.length + 8;

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

var commandNameFromCode = "COMMAND GET_WORKSPACES SUBSCRIBE GET_OUTPUTS GET_TREE GET_MARKS GET_BAR_CONFIG GET_VERSION GET_BINDING_MODES GET_CONFIG SEND_TICK SYNC".split(' ');
var commandCodeFromName = {};
commandNameFromCode.forEach(function(name, code) { commandCodeFromName[name] = code; });

var eventNameFromCode = "workspace output mode window barconfig_update binding shutdown tick".split(' ');
var eventCodeFromName = {};
eventNameFromCode.forEach(function(name, code) { eventCodeFromName[name] = code; });

// Establish API mocking before all tests.
beforeAll(() => {

  function I3Message(buff) {
    this.magic = buff.slice(0, I3_MAGIC.length);
    this.payloadLength = buff.readUInt32LE(I3_MAGIC.length);
    this.code = buff.readUInt16LE(I3_MAGIC.length + 4);
    this.payload = null;
    this.isEvent = (buff.readUInt8(I3_MAGIC.length + 7) & 0x80) == 0x80;
  }

  var self = this;
  self._stream = null;
  var spath = path.join(process.cwd(), 'tests', 'i3-shade.sock')
  globals.__SOCKET_PATH__ = spath
  server = require('net').createServer({}, (conn) => {
    self._stream = conn
    self._waitHeader = true
    self._stream.on('readable', () => {
      while(1) {
        if (self._waitHeader) {
          var header = self._stream.read(I3_MESSAGE_HEADER_LENGTH);
          if (header) {
            self._message = new I3Message(header);
            if (self._message.payloadLength == 0) {
              // Here i3/lib/ipc.js calls self._handleMessage();
              switch(self._message.code) {
                case 1:
                  self._stream.write(encodeCommand(1,
                    '[{ "num": 1, "name": "1", "visible": true, "focused": true, "urgent": false, "rect": {  "x": 0,  "y": 0,  "width": 1280,  "height": 800 }, "output": "LVDS1"}]'
                  ))
                  break;
              }
            } else {
              self._waitHeader = false;
            }
          } else break;
        }
        else {
          var data = self._stream.read(self._message.payloadLength);
          if (data) {
            self._message.payload = data;
            // Here i3/lib/ipc.js calls self._handleMessage();
            switch(self._message.code) {
              case 0:
                var wsNum = Number(self._message.payload.toString().split(' ').pop())
                server.emit('workspace', wsNum)
              case 2:
                self._stream.write(encodeCommand(0, '[{"success": true}]'))
            }
            self._waitHeader = true;
          } else break;
        }
      }
    })

    // code 0
    server.on('workspace', (wsNum) => {
      var payload = {
        "change": "focus",
        "current":
        {
          "num": wsNum,
          "id": 28489712,
          "type": "workspace"
        },
        "old":
        {
          "num": 1,
          "id": 28489715,
          "type": "workspace"
        }
      }
      conn.write(encodeCommand((0x080000000), JSON.stringify(payload)))
    })

    // code 5
    server.on('binding', () => {
      var payload = {
        "change": "run",
        "binding":
        {
          "command": "nop i3-shade-exempt",
          "event_state_mask": [ "mod4", "ctrl" ],
          "input_code": 0,
          "symbol": "space",
          "input_type": "keyboard"
        }
      }
      conn.write(encodeCommand((0x080000005), JSON.stringify(payload)))
    })

    // code 3
    server.on('window', () => {
      var payload = {
        "change": "focus",
        "container":
        {
          "id": 35569536,
          "type": "con",
          "focused": true
        }
      }
      conn.write(encodeCommand((0x080000003), JSON.stringify(payload)))
    })
  });
  server.listen(globals.__SOCKET_PATH__)
  globals.__SERVER__ = server
})

afterAll(() => {
  server.close()
})
