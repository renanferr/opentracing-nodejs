import { Tags } from 'opentracing'

export interface LogPayload {
    event: string
    message: string
    stack: string
    'error.object': Error
    'error.kind'?: string
}

export default class Span {

    name: string
    Tags: any
    _span: any
    _finished: boolean

    constructor(name: string, openTracingSpan: any) {
        this.name = name
        this._span = openTracingSpan
        this.Tags = Tags
        this._finished = false
    }

    _serializeError(e: any): Error {
        if (e instanceof Error) {
            return e
        } else {
            switch (typeof e) {
                case 'string':
                    e = new Error(e)
                    break
                case 'object':
                    e = new Error(e.message || "Error")
                    break
                default:
                    e = new Error("Error")
                    break
            }
            return e
        }
    }

    log(payload: LogPayload): void {
        this._span.log(payload)
    }

    logError(error: any, kind?: string): void {
        error = this._serializeError(error)
        this.setTag(this.Tags.ERROR, true)
        this.log({
            event:          'error',
            message:        error.message,
            stack:          error.stack,
            'error.object': error,
            'error.kind':   kind,
        })
    }

    _handleThrownError(error: any): void {
        this.logError(error)
        this.finish()
    }

    // See: https://github.com/opentracing/specification/blob/master/semantic_conventions.md
    setTag(tag: string, value: any): void {
        this._span.setTag(tag, value)
    }

    setTags(tags: object): void {
        Object.entries(tags).forEach(([tag, value]) => this.setTag(tag, value))
    }

    context(): any {
        return this._span.context()
    }

    finish(): void {
        this._span.finish()
        this._setFinished(true)
    }

    _setFinished(finished: boolean): void {
        this._finished = finished
    }

    isFinished(): boolean {
        return this._finished
    }
}