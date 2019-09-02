const expect = require('chai').expect
const { serviceName, serverUrl, secretToken, tracer } = require('../util/singleton')
const { Tracer, TracerExceptions, Tags } = require('../../lib')

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

  it("should have decorate method", done => {
    expect(tracer.decorate).to.not.be.undefined
    done()
  })

  it("should decorate provided function", done => {
    const oneFn = () => 1
    const decorated = tracer.decorate(oneFn)
    expect(decorated).to.not.be.undefined
    expect(decorated).to.be.instanceOf(Function)
    expect(decorated()).to.equal(1)
    done()
  })

  it("should decorate provided function and throw error if any", done => {
    const oneFn = () => { throw new Error("error") }
    const decorated = tracer.decorate(oneFn)
    expect(decorated).to.not.be.undefined
    expect(decorated).to.be.instanceOf(Function)
    expect(decorated).to.throw('error')
    done()
  })

  it("should decorated provided function and catch error if any", done => {
    const errorMessage = 'error'
    const errorFn = () => { throw new Error(errorMessage) }
    const decorated = tracer.decorate(errorFn)
    expect(decorated).to.not.be.undefined
    expect(decorated).to.be.instanceOf(Function)
    expect(decorated).to.throw(errorMessage)
    done()
  })

  it("should decorated provided async function", done => {
    const asyncOneFn = async () => 1
    const decorated = tracer.decorate(asyncOneFn)
    expect(decorated).to.not.be.undefined
    expect(decorated).to.be.instanceOf(Function)
    const promise = decorated()
    expect(promise).to.be.instanceOf(Promise)
    // expect(promise).to.throw
    promise
      .then(resolved => {
        expect(resolved).to.equal(1)
        done()
      })
  })

  it("should decorated provided async function and catch error if any", done => {
    const errorMessage = 'error'
    const asyncErrorFn = () => new Promise((resolve, reject) => reject(new Error(errorMessage)))
    const decorated = tracer.decorate(asyncErrorFn)
    expect(decorated).to.not.be.undefined
    expect(decorated).to.be.instanceOf(Function)

    const p = decorated()
    expect(p).to.be.instanceOf(Promise)

    p
      .catch(err => {
        expect(err).to.not.be.undefined
        expect(err).to.be.instanceOf(Error)
        expect(err).to.have.property('message', 'error')
        done()
      })
  })
})

