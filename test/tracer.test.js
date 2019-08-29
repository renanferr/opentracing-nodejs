const expect = require('chai').expect
const { serviceName, serverUrl, secretToken, tracer } = require('./testTracerSingleton')
const { Tracer } = require('../lib')


describe("Tracer", () => {
    it("should have config properties", done => {
        expect(tracer).to.be.instanceOf(Tracer)
        expect(tracer.serverUrl).to.equal(serverUrl)
        expect(tracer.serviceName).to.equal(serviceName)
        expect(tracer.secretToken).to.equal(secretToken)
        done()
    })

    // it("should throw span error for empty string", done => {
    
    // })
})
