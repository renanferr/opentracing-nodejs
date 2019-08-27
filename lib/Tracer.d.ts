import Span from './Span';
export interface TracerConfig {
    serviceName: string;
    serverUrl: string;
    secretToken: string;
}
export default class Tracer {
    Tags: any;
    serviceName: string;
    secretToken: string;
    serverUrl: string;
    _agent: any;
    _tracer: any;
    constructor(config: TracerConfig);
    _throwSpanNameError(): void;
    startSpan(name: string): Span;
    decorate(fn: Function, spanName?: string): Function;
    decorateExpress(fn: Function, spanName?: string): Function;
}
