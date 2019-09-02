const lib = require('../../lib')
const expect = require('chai').expect
const { tracer } = require('../util/singleton')
const request = require('supertest')

function getApp(handlers) {
  const app = require('express')()



  handlers
    .forEach(({ route, method, handlerFunc }) => {
      app[method.toLowerCase()](route, handlerFunc)
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
  it.only('responds with json', function (done) {
    const app = require('express')()

    function handler(req, res, next) {
      return res.status(200).send('OK')
    }

    app.get('/', (req, res, next) => {
      const serverResponse = tracer.decorate(handler)(req, res, next)
      // console.log({ serverResponse })
      expect(serverResponse.statusCode).to.equal(200)
      return serverResponse
    })

    request(getApp([
      {
        route: '/',
        method: 'get',
        handlerFunc: (req, res, next) => res.status(200).send('OK')
      },
      {
        route: '/error',
        method: 'get',
        handlerFunc: (req, res, next) => res.status(500).send(new Error("error"))
      }
    ]))
      .get('/')
      .expect(200, done)
  });
});