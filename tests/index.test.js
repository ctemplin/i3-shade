const { globals } = require("../jest.config")

describe('IPC daemon', () => {
  it('gets the global socket', () => {
    expect(globals.__SOCKET_PATH).not.toBeNull()
  })
})

describe('i3-shade', () => {
  var i3shade, workspaceSpy, bindingSpy, markSpy, windowSpy

  beforeAll( done => {
    Shade = require('../src/lib/shade')
    i3shade = new Shade('shade-jest', 'shade-jest-exempt', globals.__SOCKET_PATH__, globals.__EXEMPT_COM__)
    Shade.prototype.getFcsdWinNum = function(){ return this.fcsdWsNum }
    workspaceSpy = jest.spyOn(i3shade, 'handleWorkspaceEvent')
    bindingSpy = jest.spyOn(i3shade, 'handleBindingEvent')
    // Spy on shade's set mark command
    this.markCallback = function(err, json) {return json[0]}
    markSpy = jest.spyOn(this, 'markCallback')
    this.windowCallback = function(err, json) {return json}
    windowSpy = jest.spyOn(this, 'windowCallback')
    i3shade.connect(
      shadeCallbacks = {
        connect: function(stream) { done() },
        mark: markSpy,
        window: windowSpy
      }
    )
  })

  test('gets the initial workspace number', () => {
    expect(i3shade.getFcsdWinNum()).toEqual(1)
  })

  test('updates the workspace number twice', done => {
    cb = function(err, json) { 
      try {
        if (err) { done(err); return; }
        expect(json[0].success).toBeTruthy()
        expect(workspaceSpy).toHaveBeenCalledTimes(1)
        expect(i3shade.getFcsdWinNum()).toEqual(2)
        i3shade.i3.command("workspace number 1", cb2)
      } catch(error) {
        done(error)
      }
    }

    cb2 = function(err, json) {
      try {
        if (err) { done(err); return; }
        expect(json[0].success).toBeTruthy()
        expect(workspaceSpy).toHaveBeenCalledTimes(2)
        expect(i3shade.getFcsdWinNum()).toEqual(1)
        done()
      } catch(error) {
        done(error)
      }
    }

    i3shade.i3.command("workspace number 2", cb)
  })

  test('reponds to exempt binding', done => {
    cb = function(err, json) {
      try {
        if (err) done(err)
        expect(bindingSpy).toHaveBeenCalledTimes(1)
        expect(json[0].success).toBeTruthy()
        setTimeout(cb2, 50) // time for shade's command callback to run
      } catch (error) {
        done(error)
      }
    }
    cb2 = function() {
      try {
        expect(markSpy).toHaveBeenCalledTimes(1)
        expect(markSpy.mock.results[0].type).toEqual('return')
        expect(markSpy.mock.results[0].value.success).toEqual(true)
        done()
      } catch (error) {
        done(error)
      }
    }
    i3shade.i3.command(globals.__EXEMPT_COM__, cb)
  })
})