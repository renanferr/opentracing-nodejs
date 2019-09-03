const lib = require('../lib')
const expect = require('chai').expect
const { tracer } = require('./util/singleton')
const request = require('supertest')

function getApp(handlers) {
  const app = require('express')()

  if (!Array.isArray(handlers)) {
    handlers = [handlers]
  }

  handlers
    .forEach(({ route, method, middlewares, handlerFunc }) => {
      if (!middlewares) {
        middlewares = []
      }

      if (!Array.isArray(middlewares)) {
        middlewares = [middlewares]
      }
      app[method.toLowerCase()](route, ...middlewares, handlerFunc)
    })

  return app
}

describe('Express Integration', () => {
  it("should decorate provided express handler", done => {
    const expressHandlr = (req, res) => res.status(200).send('OK')
    const decorated = tracer.decorateExpress(expressHandlr)
    expect(decorated).to.not.be.undefined
    expect(decorated).to.be.instanceOf(Function)
    done()
  })
})

describe('GET /user', function () {

  it('should return 200 for decorated handler function', function (done) {

    const handlerFunc = (req, res, next) => res.sendStatus(200)

    const app = getApp({
      route: '/',
      method: 'GET',
      handlerFunc: tracer.decorate(handlerFunc, 'integration-test')
    })

    request(app)
      .get('/')
      .expect(200, done)
  });

  it('should return 200 with content-type headers for decorated middleware + handler function', function (done) {

    const middleware = (req, res, next) => {
      res.set('x-ping', 'pong')
      next()
    }
    const handlerFunc = (req, res, next) => res.sendStatus(200)
    const app = getApp({
      route: '/',
      method: 'GET',
      middlewares: [middleware],
      handlerFunc: tracer.decorate(handlerFunc, 'integration-test')
    })

    request(app)
      .get('/')
      .expect('x-ping', 'pong')
      .expect(200, done)
  });

  it('should return 500 for decorated handler function', function (done) {

    const handlerFunc = (req, res, next) => res.sendStatus(500)

    const app = getApp({
      route: '/',
      method: 'GET',
      handlerFunc: tracer.decorate(handlerFunc, 'integration-test')
    })

    request(app)
      .get('/')
      .expect(500, done)
  });
});