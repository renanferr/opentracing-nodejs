import Span from './Span';
export default class Tracer {
    Tags: any;
    serviceName: string;
    secretToken: string;
    serverUrl: string;
    _agent: any;
    _tracer: any;
    _exceptions: ITracerExceptions;
    constructor(config: TracerConfig);
    startSpan(name: string): Span;
    decorate(fn: Function, spanName?: string): Function;
    decorateExpress(fn: Function, spanName?: string): Function;
}
export declare const TracerExceptions: ITracerExceptions;
export interface ITracerExceptions {
    INVALID_SPAN_NAME: string;
}
export interface TracerConfig {
    serviceName: string;
    serverUrl: string;
    secretToken: string;
}
