export interface LogPayload {
    event: string;
    message: string;
    stack: string;
    'error.object': Error;
    'error.kind'?: string;
}
export default class Span {
    name: string;
    Tags: any;
    _span: any;
    _finished: boolean;
    constructor(name: string, span: any);
    addTag: (tag: string, value: any) => void;
    addLabel: (tag: string, value: any) => void;
    setLabel: (tag: string, value: any) => void;
    addTags: (tags: object) => void;
    addLabels: (tags: object) => void;
    setLabels: (tags: object) => void;
    getLabel: (tag: string) => any;
    getLabels: () => any;
    _sanitizeError(e: any): Error;
    log(payload: LogPayload): void;
    logError(error: any, kind?: string): void;
    _handleThrownError(error: any): void;
    setTag(tag: string, value: any): void;
    setTags(tags: object): void;
    getTag(tag: string): any;
    getTags(): any;
    context(): any;
    finish(): void;
    _setFinished(finished: boolean): void;
    isFinished(): boolean;
}
