const lib = require('../../lib')
const expect = require('chai').expect

describe('Module', () => {
    it('should import Tracer', done => {
        expect(lib.Tracer).to.not.be.undefined
        expect(lib.Tracer).to.be.instanceOf(Function)
        done()
    })

    it('should import Span', done => {
        expect(lib.Span).to.not.be.undefined
        expect(lib.Span).to.be.instanceOf(Function)
        done()
    })

    it('should import TracerExceptions', done => {
        expect(lib.TracerExceptions).to.not.be.undefined
        expect(lib.TracerExceptions).to.be.instanceOf(Object)
        done()
    })

    it('should import Opentracing Tags', done => {
        expect(lib.Tags).to.not.be.undefined
        expect(lib.Tags).to.be.instanceOf(Object)
        done()
    })
})