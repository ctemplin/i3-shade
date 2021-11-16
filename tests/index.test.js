const { Server } = require("http")
const { globals } = require("../jest.config")

describe('IPC daemon', () => {
  it('gets the global socket', () => {
    expect(globals.__SOCKET_PATH).not.toBeNull()
  })
})

describe('i3-ipc', () => {
  var i3
  beforeAll(() => {
    i3 = require('i3').createClient({ path: globals.__SOCKET_PATH__ })
  })
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
    
    i3.command('workspace 1', cb)
  })

  describe('i3-shade', () => {
    var shadeProc

    beforeAll(() =>{
      shadeProc = require('child_process').spawn(
        'node',
        ['--title', 'i3-shade-jest', '--', 'src/index.js', '--prefix=shade-jest', '--exempt=shade-jest-exempt', '--socketpath=' + globals.__SOCKET_PATH__],
        { stdio: 'pipe' }
      )
    })

    afterAll(() => {
      shadeProc.kill()
    })

    it('does it', done => {
      //console.log(shadeProc._handle.pid)
      try {
        shadeProc.stdout.on('data', (d) => {
          console.log(d.toString())
          expect(d.toString()).toEqual(5)
          done()
        })
        globals.__SERVER__.emit('binding')
        globals.__SERVER__.emit('binding')
      } catch (err) {
        console.error(err)
        done(err)
      }
    })

  })

})