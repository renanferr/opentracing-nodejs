import Span from './Span';
import { LabelValue, Labels } from './Span';
export declare class Tracer {
    serviceName: string | undefined;
    secretToken: string | undefined;
    serverUrl: string | undefined;
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
    abortedErrorThreshold?: string;
    active?: boolean;
    addPatch?: KeyValueConfig;
    apiRequestSize?: string;
    apiRequestTime?: string;
    asyncHooks?: boolean;
    captureBody?: CaptureBody;
    captureErrorLogStackTraces?: CaptureErrorLogStackTraces;
    captureExceptions?: boolean;
    captureHeaders?: boolean;
    captureSpanStackTraces?: boolean;
    containerId?: string;
    disableInstrumentations?: string | string[];
    environment?: string;
    errorMessageMaxLength?: string;
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
    metricsInterval?: string;
    payloadLogFile?: string;
    centralConfig?: boolean;
    secretToken?: string;
    serverTimeout?: string;
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
declare type CaptureBody = 'off' | 'errors' | 'transactions' | 'all';
declare type CaptureErrorLogStackTraces = 'never' | 'messages' | 'always';
declare type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
declare type KeyValueConfig = string | Labels | Array<Array<LabelValue>>;
interface Logger {
    fatal(msg: string, ...args: any[]): void;
    fatal(obj: {}, msg?: string, ...args: any[]): void;
    error(msg: string, ...args: any[]): void;
    error(obj: {}, msg?: string, ...args: any[]): void;
    warn(msg: string, ...args: any[]): void;
    warn(obj: {}, msg?: string, ...args: any[]): void;
    info(msg: string, ...args: any[]): void;
    info(obj: {}, msg?: string, ...args: any[]): void;
    debug(msg: string, ...args: any[]): void;
    debug(obj: {}, msg?: string, ...args: any[]): void;
    trace(msg: string, ...args: any[]): void;
    trace(obj: {}, msg?: string, ...args: any[]): void;
    [propName: string]: any;
}
export {};
