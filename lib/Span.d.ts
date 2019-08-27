export default class Span {
    name: string;
    Tags: any;
    _span: any;
    _finished: boolean;
    constructor(name: string, openTracingSpan: any);
    _serializeError(e: any): Error;
    log(payload: any): void;
    logError(error: any, kind?: string): void;
    _handleThrownError(error: any): void;
    setTag(tag: string, value: any): void;
    setTags(tags: object): void;
    context(): any;
    finish(): void;
    _setFinished(finished: boolean): void;
    isFinished(): boolean;
}
