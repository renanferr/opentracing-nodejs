import { Tags } from 'opentracing'
import apm from 'elastic-apm-node'
import OpenTracer from 'elastic-apm-node-opentracing'
import Span from './Span'
import { Response, Request, NextFunction } from 'express'

export default class Tracer {

  Tags: any

  serviceName: string

  secretToken: string

  serverUrl: string

  _agent: any

  _tracer: any

  _exceptions: ITracerExceptions
  
  constructor(config: TracerConfig) {
    this.serviceName = config.serviceName
    this.secretToken = config.secretToken
    this.serverUrl = config.serverUrl
    // console.log("Starting")
    this._agent = apm.start(config)
    this._tracer = new OpenTracer(this._agent)    
    this.Tags = Tags
    this._exceptions = TracerExceptions
  }

  startSpan(name: string): Span {
    if (!name) {
      throw new Error(this._exceptions.INVALID_SPAN_NAME)
    }
    return new Span(name, this._tracer.startSpan(name))
  }

  decorate(fn: Function, spanName: string = fn.name): Function {
    const tracer = this

    if (!spanName) {
      throw new Error(this._exceptions.INVALID_SPAN_NAME)
    }

    return function (...args: any[]): any {
      const span = tracer.startSpan(spanName)
      let fnReturn

      try {
        fnReturn = fn.call(fn, ...args)
        if (fnReturn instanceof Promise) {
          return fnReturn
            .then(resolved => {
              span.finish()
              return resolved
            })
            .catch(span._handleThrownError)
        }
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
      throw new Error(this._exceptions.INVALID_SPAN_NAME)
    }

    const tracer = this

    return function (req: Request, res: Response, next?: NextFunction): any {
      // console.log("Span created", spanName)

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

      span.addTags({
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

export const TracerExceptions: ITracerExceptions = {
  INVALID_SPAN_NAME: `A name for the span was not provided and it could not use it's own function's name. To properly name your span, please provide it as a second argument to the decorate functions. e.g.: tracer.decorate(myFunc, 'my-span-name')`,
}

export interface ITracerExceptions {
  INVALID_SPAN_NAME: string
}

export interface TracerConfig {
  serviceName: string
  serverUrl: string
  secretToken: string
}