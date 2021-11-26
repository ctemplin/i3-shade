const { globals } = require("../jest.config")

describe('IPC daemon', () => {
  it('gets the global socket', () => {
    expect(globals.__SOCKET_PATH).not.toBeNull()
  })
})

describe('i3-shade', () => {
  var i3shade, workspaceSpy, bindingSpy, markExemptSpy, markShadedSpy, unmarkShaded //windowSpy

  beforeAll( done => {
    Shade = require('../src/lib/shade')
    i3shade = new Shade(globals.__SHADE_PREF__, globals.__SHADE_EXEMPT__, globals.__SOCKET_PATH__, globals.__EXEMPT_COM__)
    Shade.prototype.getFcsdWinNum = function(){ return this.fcsdWsNum }
    workspaceSpy = jest.spyOn(i3shade, 'handleWorkspaceEvent')
    bindingSpy = jest.spyOn(i3shade, 'handleBindingEvent')

    // Spy on shade's set mark commands
    this.markExemptCallback = function(err, json) {return json[0]}
    markExemptSpy = jest.spyOn(this, 'markExemptCallback')
    this.markShadedCallback = function(err, json) {return json[0]}
    markShadedSpy = jest.spyOn(this, 'markShadedCallback')
    this.unmarkShadedCallback = function(err, json) {return json[0]}
    unmarkShadedSpy = jest.spyOn(this, 'unmarkShadedCallback')

    // this.windowCallback = function(err, json) {return json}
    // windowSpy = jest.spyOn(this, 'windowCallback')

    i3shade.connect(
      shadeCallbacks = {
        connect: function(stream) { done() },
        markExempt: markExemptSpy,
        markShaded: markShadedSpy,
        unmarkShaded: unmarkShadedSpy
        // window: windowSpy
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
        expect(markExemptSpy).toHaveBeenCalledTimes(1)
        expect(markExemptSpy.mock.results[0].type).toEqual('return')
        expect(markExemptSpy.mock.results[0].value.success).toEqual(true)
        done()
      } catch (error) {
        done(error)
      }
    }
    i3shade.i3.command(globals.__EXEMPT_COM__, cb)
  })

  test('responds to tiling window focus', done => {
    cb = function(err, json) {
      try {
        if (err) done(err)
        expect(json[0].success).toEqual(true)
        setTimeout(cb2, 50) // time for shade's command callback to run
      } catch (error) {
        done(error)
      }
    }
    cb2 = function() {
      try {
        expect(markShadedSpy).toHaveBeenCalledTimes(1)
        expect(markShadedSpy.mock.results[0].type).toEqual('return')
        expect(markShadedSpy.mock.results[0].value.success).toEqual(true)
        done()
      } catch (error) {
        done(error)
      }
    }
    i3shade.i3.command('focus tiling', cb)
  })

  test('responds to floating window focus', done => {
    cb = function(err, json) {
      try {
        if (err) done(err)
        expect(json[0].success).toEqual(true)
        setTimeout(cb2, 50) // time for shade's command callback to run
      } catch (error) {
        done(error)
      }
    }
    cb2 = function() {
      try {
        expect(unmarkShadedSpy).toHaveBeenCalledTimes(1)
        expect(unmarkShadedSpy.mock.results[0].type).toEqual('return')
        expect(unmarkShadedSpy.mock.results[0].value.success).toEqual(true)
        done()
      } catch (error) {
        done(error)
      }
    }
    i3shade.i3.command('focus floating', cb)
  })

})