const { globals } = require('../jest.config');
const path = require('path');

var server
const I3_MAGIC = new Buffer.from('i3-ipc');

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

// Establish API mocking before all tests.
beforeAll(() => {
  var spath = path.join(process.cwd(), 'tests', 'i3-shade.sock')
  globals.__SOCKET_PATH__ = spath
  server = require('net').createServer({}, (conn) => {
    conn.on('data', (msg) => {
      msg = msg.toString()
      if (msg.indexOf("mark") > -1) {
        console.log('mark')
      }
      if (msg === "i3-ipc") {
        conn.write(encodeCommand(0))
      } else {
        var payload = '[{ "success": true }]'
        conn.write(encodeCommand(0, payload))
      }
    })

    server.on('binding', done => {
      console.log('handling binding event')
      var payload = '{ "change": "run", "binding": { "command": "nop i3-shade-exempt", "event_state_mask": [ "shift", "ctrl"  ], "input_code": 0, "symbol": "t", "input_type": "keyboard" }}'
      conn.write(encodeCommand((0x80000005), payload))
    })

  });
  server.listen(globals.__SOCKET_PATH__)
  globals.__SERVER__ = server
})

afterAll(() => {
  server.close()
})
