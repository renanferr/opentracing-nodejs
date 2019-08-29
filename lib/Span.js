"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const opentracing_1 = require("opentracing");
class Span {
    constructor(name, openTracingSpan) {
        this.name = name;
        this._span = openTracingSpan;
        this.Tags = opentracing_1.Tags;
        this._finished = false;
    }
    _serializeError(e) {
        if (e instanceof Error) {
            return e;
        }
        else {
            switch (typeof e) {
                case 'string':
                    e = new Error(e);
                    break;
                case 'object':
                    e = new Error(e.message || "Error");
                    break;
                default:
                    e = new Error("Error");
                    break;
            }
            return e;
        }
    }
    log(payload) {
        this._span.log(payload);
    }
    logError(error, kind) {
        error = this._serializeError(error);
        this.setTag(this.Tags.ERROR, true);
        this.log({
            event: 'error',
            message: error.message,
            stack: error.stack,
            'error.object': error,
            'error.kind': kind,
        });
    }
    _handleThrownError(error) {
        this.logError(error);
        this.finish();
    }
    // See: https://github.com/opentracing/specification/blob/master/semantic_conventions.md
    setTag(tag, value) {
        this._span.setTag(tag, value);
    }
    setTags(tags) {
        Object.entries(tags).forEach(([tag, value]) => this.setTag(tag, value));
    }
    context() {
        return this._span.context();
    }
    finish() {
        this._span.finish();
        this._setFinished(true);
    }
    _setFinished(finished) {
        this._finished = finished;
    }
    isFinished() {
        return this._finished;
    }
}
exports.default = Span;
