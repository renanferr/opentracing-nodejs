const expect = require('chai').expect
const { serviceName, serverUrl, secretToken, tracer } = require('./testTracerSingleton')
const { Tracer, TracerExceptions } = require('../lib')

describe("Tracer", () => {
    it("should have provided config", done => {
        expect(tracer).to.be.instanceOf(Tracer)
        expect(tracer.serverUrl).to.equal(serverUrl)
        expect(tracer.serviceName).to.equal(serviceName)
        expect(tracer.secretToken).to.equal(secretToken)
        done()
    })

    it("should throw span error for undefined span name", done => {
        expect(tracer.startSpan.bind(tracer)).to.throw(TracerExceptions.INVALID_SPAN_NAME)
        done()
    })

    it("should throw span error for empty string span name", done => {
        expect(tracer.startSpan.bind(tracer, '')).to.throw(TracerExceptions.INVALID_SPAN_NAME)
        done()
    })
})
