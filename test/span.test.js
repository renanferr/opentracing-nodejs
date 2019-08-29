const { serviceName, serverUrl, secretToken, tracer } = require('./testTracerSingleton')
const expect = require('chai').expect
const { Span } = require('../lib')

describe("Span", () => {
  it("should have provided name", done => {
    const name = 'my-span-name'
    const s = tracer.startSpan(name)
    expect(s).to.be.instanceOf(Span)
    expect(s).to.haveOwnProperty('name')
    expect(s.name).to.equal(name)
    s.finish()
    done()
  })

  it("should serialize error message string to error object", done => {
    const str = "Error message"
    const s = tracer.startSpan('test-tracer')
    const serialized = s._serializeError(str)
    expect(serialized).to.be.instanceOf(Error)
    expect(serialized.message).to.equal(str)
    s.finish()
    done()
  })
})
