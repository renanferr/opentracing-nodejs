import { Tags } from 'opentracing'
import apm from 'elastic-apm-node'
import OpenTracer from 'elastic-apm-node-opentracing'
import Span from './Span'
import { Response, Request, NextFunction } from 'express'
import { LabelValue, Labels } from './Span'

export class Tracer {

  serviceName: string | undefined

  secretToken: string | undefined

  serverUrl: string | undefined

  _agent: any

  _tracer: any

  _exceptions: ITracerExceptions
  
  constructor(config: TracerConfig) {
    this.serviceName = config.serviceName
    this.secretToken = config.secretToken
    this.serverUrl = config.serverUrl
    this._agent = apm.start(config)
    this._tracer = new OpenTracer(this._agent)    
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
            .catch(e => {
              span._handleThrownError(e)
              return Promise.reject(e)
            })
        }
      } catch (e) {
        span._handleThrownError(e)
        throw e
      }
      
      if (!span.isFinished()) {
        span.finish()
      }
      return fnReturn
    }
  }

  decorateExpress(fn: Function, spanName: string = fn.name): Function {
    if (!spanName) {
      throw new Error(this._exceptions.INVALID_SPAN_NAME)
    }

    const tracer = this

    return function (req: Request, res: Response, next?: NextFunction): any {

      const span: Span = tracer.startSpan(spanName)

      let fnReturn: any

      try {
        fnReturn = fn.call(fn, req, res, next)
        if (fnReturn instanceof Promise) {
          return fnReturn
            .then(resolved => {
              span.finish()
              return resolved
            })
            .catch(e => {
              span._handleThrownError(e)
              return Promise.reject(e)
            })
        }
      } catch (e) {
        span._handleThrownError(e)
        throw e
      }

      const statusCode: number = res.statusCode

      span.addTags({
        [Tags.COMPONENT]: 'express',
        [Tags.HTTP_METHOD]: req.method,
        [Tags.HTTP_URL]: req.url,
        [Tags.HTTP_STATUS_CODE]: statusCode
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
  abortedErrorThreshold?: string; // Also support `number`, but as we're removing this functionality soon, there's no need to advertise it
  active?: boolean;
  addPatch?: KeyValueConfig;
  apiRequestSize?: string; // Also support `number`, but as we're removing this functionality soon, there's no need to advertise it
  apiRequestTime?: string; // Also support `number`, but as we're removing this functionality soon, there's no need to advertise it
  asyncHooks?: boolean;
  captureBody?: CaptureBody;
  captureErrorLogStackTraces?: CaptureErrorLogStackTraces;
  captureExceptions?: boolean;
  captureHeaders?: boolean;
  captureSpanStackTraces?: boolean;
  containerId?: string;
  disableInstrumentations?: string | string[];
  environment?: string;
  errorMessageMaxLength?: string; // Also support `number`, but as we're removing this functionality soon, there's no need to advertise it
  errorOnAbortedRequests?: boolean;
  filterHttpHeaders?: boolean;
  frameworkName?: string;
  frameworkVersion?: string;
  globalLabels?: KeyValueConfig;
  hostname?: string;
  ignoreUrls?: Array<string | RegExp>;
  ignoreUserAgents?: Array<string | RegExp>;
  instrument?: boolean;
  kubernetesNamespace?: string;
  kubernetesNodeName?: string;
  kubernetesPodName?: string;
  kubernetesPodUID?: string;
  logLevel?: LogLevel;
  logger?: Logger;
  metricsInterval?: string; // Also support `number`, but as we're removing this functionality soon, there's no need to advertise it
  payloadLogFile?: string;
  centralConfig?: boolean;
  secretToken?: string;
  serverTimeout?: string; // Also support `number`, but as we're removing this functionality soon, there's no need to advertise it
  serverUrl?: string;
  serviceName?: string;
  serviceVersion?: string;
  sourceLinesErrorAppFrames?: number;
  sourceLinesErrorLibraryFrames?: number;
  sourceLinesSpanAppFrames?: number;
  sourceLinesSpanLibraryFrames?: number;
  stackTraceLimit?: number;
  transactionMaxSpans?: number;
  transactionSampleRate?: number;
  usePathAsTransactionName?: boolean;
  verifyServerCert?: boolean;
}

type CaptureBody = 'off' | 'errors' | 'transactions' | 'all';
type CaptureErrorLogStackTraces = 'never' | 'messages' | 'always';
type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

type KeyValueConfig = string | Labels | Array<Array<LabelValue>>

interface Logger {
  fatal (msg: string, ...args: any[]): void;
  fatal (obj: {}, msg?: string, ...args: any[]): void;
  error (msg: string, ...args: any[]): void;
  error (obj: {}, msg?: string, ...args: any[]): void;
  warn (msg: string, ...args: any[]): void;
  warn (obj: {}, msg?: string, ...args: any[]): void;
  info (msg: string, ...args: any[]): void;
  info (obj: {}, msg?: string, ...args: any[]): void;
  debug (msg: string, ...args: any[]): void;
  debug (obj: {}, msg?: string, ...args: any[]): void;
  trace (msg: string, ...args: any[]): void;
  trace (obj: {}, msg?: string, ...args: any[]): void;
  [propName: string]: any;
}