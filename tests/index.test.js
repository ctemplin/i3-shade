const { globals } = require("../jest.config")

describe('IPC daemon', () => {
  it('gets the global socket', () => {
    expect(globals.__SOCKET_PATH__).not.toBeUndefined()
    expect(globals.__SOCKET_PATH__).not.toBeNull()
  })
})

describe('i3-shade', () => {
  var i3server, i3shade, workspaceSpy, bindingSpy, markExemptSpy, markShadedSpy, unmarkShadedSpy

  beforeAll( done => {
    i3server = globals.__I3_MOCK_SERVER__
    i3server.responses.workspaces = require('./data-mocks/cm_workspaces_initial.json')
    i3server.responses.tree = require('./data-mocks/cm_tree.json')

    Shade = require('../src/lib/shade')
    i3shade = new Shade(
      globals.__SHADE_PREF__,
      globals.__SHADE_EXEMPT__,
      globals.__SOCKET_PATH__,
      globals.__EXEMPT_COM__
    )
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

    i3shade.connect(
      shadeCallbacks = {
        connect: function(stream) { done() },
        markExempt: markExemptSpy,
        markShaded: markShadedSpy,
        unmarkShaded: unmarkShadedSpy
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
        resp.current.num = 1
        i3server.responses.workspace = resp
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
    expect(workspaceSpy).toHaveBeenCalledTimes(0)
    let resp = require('./data-mocks/ev_workspace_focus.json')
    resp.current.num = 2
    i3server.responses.workspace = resp
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
    expect(markExemptSpy).toHaveBeenCalledTimes(0)
    let resp = require('./data-mocks/ev_binding_shade-exempt.json')
    resp.binding.command = globals.__EXEMPT_COM__
    i3server.responses.exempt = resp
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
    expect(markShadedSpy).toHaveBeenCalledTimes(0)
    let resp = require('./data-mocks/ev_window_focus.json')
    resp.container.floating = "user_off"
    resp.container.marks = []
    i3server.responses.focus = resp
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
    expect(unmarkShadedSpy).toHaveBeenCalledTimes(0)
    let resp = require('./data-mocks/ev_window_focus.json')
    resp.container.floating = "user_on"
    resp.container.marks = [globals.__SHADE_PREF__ + "_1_1_999"]
    i3server.responses.focus = resp
    i3shade.i3.command('focus floating', cb)
  })

})