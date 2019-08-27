const { serviceName, serverUrl, secretToken, tracer } = require('./testTracerSingleton')
const expect = require('chai').expect
const { Span } = require('../lib')

describe("Span", () => {
  it("should have name", done => {
    const name = 'my-span-name'
    const s = tracer.startSpan(name)
    expect(s).to.be.instanceOf(Span)
    expect(s).to.haveOwnProperty('name')
    expect(s.name).to.equal(name)
    done()
  })
})
