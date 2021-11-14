const jestConfig = require("../jest.config")
const net = require('node:net')

describe('Index', () => {
  it('runs a test', () => {
    let v = 1
    expect(v).toEqual(1)
  })

  it('initializes an IPC connection', () => {
    const i3 = require('i3').createClient((c) => {
      expect(i3._stream).toBeInstanceOf(net.Socket)
    })
  })
})