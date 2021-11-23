const { globals } = require("../jest.config")

describe('IPC daemon', () => {
  it('gets the global socket', () => {
    expect(globals.__SOCKET_PATH).not.toBeNull()
  })
})

describe('i3-ipc', () => {
  var i3shade, hweSpy

  beforeAll(() => {
    Shade = require('../src/lib/shade')
    i3shade = new Shade('shade-jest', 'shade-jest-exempt', globals.__SOCKET_PATH__, 'nop i3-shade-exempt')
    hweSpy = jest.spyOn(i3shade, 'handleWorkspaceEvent')
    i3shade.connect()
  })

  test('updates the workspace number twice', done => {
    cb = function(err, json) { 
      try {
        if (err) { done(err); return; }
        expect(json[0].success).toBeTruthy()
        expect(hweSpy).toHaveBeenCalledTimes(1)
        i3shade.i3.command("workspace 1", cb2)
      } catch(error) {
        done(error)
      }
    }

    cb2 = function(err, json) {
      try {
        if (err) { done(err); return; }
        expect(json[0].success).toBeTruthy()
        expect(hweSpy).toHaveBeenCalledTimes(2)
        done()
      } catch(error) {
        done(error)
      }
    }

    i3shade.i3.command("workspace 2", cb)
  })

  test('', done => {
    cb2 = function(err, json) { 
      try {
        if (err) { done(err); return; }
        expect(json[0].success).toBeTruthy()
        done()
      } catch(error) {
        done(error)
      }
    }
    i3shade.i3.command("workspace 1", cb2)
  })
})