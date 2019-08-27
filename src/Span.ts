import { Tags } from 'opentracing'

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
            if (typeof e === 'string') {
                e = new Error(e)
            } else if (typeof e === 'object' && !!e.message) {
                e = new Error(e.message)
            } else {
                e = new Error("Error")
            }
            return e
        }
    }

    log(payload: any): void {
        this._span.log(payload)
    }

    logError(error: any, kind?: string): void {
        error = this._serializeError(error)
        this.setTag(this.Tags.ERROR, true)
        const payload = { 'event': 'error', 'error.object': error, 'error.kind': kind, 'message': error.message, 'stack': error.stack }
        this.log(payload)
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