const { globals } = require("../jest.config")

describe('IPC daemon', () => {
  it('gets the global socket', () => {
    expect(globals.__SOCKET_PATH).not.toBeNull()
  })
})

describe('i3-ipc', () => {
  it('connects to the IPC daemon', done => {
    function cb(err, json) {
      try {
        if (err) { done(err); return; }
        expect(json[0].success).toBeTruthy()
        done()
      } catch(error) {
        done(error)
      }
    }
    require('i3').createClient({ path: globals.__SOCKET_PATH__ })
    .command('workspace 1', cb)
  })

})