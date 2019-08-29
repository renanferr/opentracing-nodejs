import { Tags } from 'opentracing'
import apm from 'elastic-apm-node'
import OpenTracer from 'elastic-apm-node-opentracing'
import Span from './Span'
import { Response, Request, NextFunction } from 'express'

export interface TracerConfig {
  serviceName: string
  serverUrl: string
  secretToken: string
}

export default class Tracer {

  Tags: any

  serviceName: string

  secretToken: string

  serverUrl: string

  _agent: any

  _tracer: any
  
  constructor(config: TracerConfig) {
    this.serviceName = config.serviceName
    this.secretToken = config.secretToken
    this.serverUrl = config.serverUrl
    console.log("Starting")
    this._agent = apm.start(config)
    this._tracer = new OpenTracer(this._agent)    
    this.Tags = Tags
  }

  _throwSpanNameError() {
    throw new Error(`A name for the span was not provided and it could not use it's own function's name. To properly name your span, please provide it as a second argument to the decorate functions. e.g.: tracer.decorate(myFunc, 'my-span-name')`)
  }

  startSpan(name: string): Span {
    if (!name) {
      this._throwSpanNameError()
    }
    return new Span(name, this._tracer.startSpan(name))
  }

  decorate(fn: Function, spanName: string = fn.name): Function {
    const tracer = this

    if (!spanName) {
      this._throwSpanNameError()
    }

    return function (...args: any[]): any {
      console.log({ args })
      console.log("Span created", spanName)
      const span = tracer.startSpan(spanName)
      let fnReturn

      try {
        fnReturn = fn.call(fn, ...args)
      } catch (e) {
        console.error(e)
        span._handleThrownError(e)
        return fnReturn
      }

      span.finish()

      return fnReturn
    }
  }

  decorateExpress(fn: Function, spanName: string = fn.name): Function {
    if (!spanName) {
      this._throwSpanNameError()
    }

    const tracer = this

    return function (req: Request, res: Response, next?: NextFunction): any {
      console.log("Span created", spanName)

      const span: Span = tracer.startSpan(spanName)

      let fnReturn: any

      try {
        fnReturn = fn.call(fn, req, res, next)
      } catch (e) {
        console.error(e)
        span._handleThrownError(e)
        return res.status(500).send(e.message || e)
      }

      const statusCode: number = res.statusCode

      span.setTags({
        [tracer.Tags.COMPONENT]: 'express',
        [tracer.Tags.HTTP_METHOD]: req.method,
        [tracer.Tags.HTTP_URL]: req.url,
        [tracer.Tags.HTTP_STATUS_CODE]: statusCode
      })

      if (statusCode > 399) {
        span.logError(res.statusMessage)
      }

      res.on('finish', () => span.finish())
      return fnReturn
    }

  }
}
