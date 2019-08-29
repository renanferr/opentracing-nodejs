"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var opentracing_1 = require("opentracing");
var Span = /** @class */ (function () {
    function Span(name, openTracingSpan) {
        this.name = name;
        this._span = openTracingSpan;
        this.Tags = opentracing_1.Tags;
        this._finished = false;
    }
    Span.prototype._serializeError = function (e) {
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
    };
    Span.prototype.log = function (payload) {
        this._span.log(payload);
    };
    Span.prototype.logError = function (error, kind) {
        error = this._serializeError(error);
        this.setTag(this.Tags.ERROR, true);
        this.log({
            event: 'error',
            message: error.message,
            stack: error.stack,
            'error.object': error,
            'error.kind': kind,
        });
    };
    Span.prototype._handleThrownError = function (error) {
        this.logError(error);
        this.finish();
    };
    // See: https://github.com/opentracing/specification/blob/master/semantic_conventions.md
    Span.prototype.setTag = function (tag, value) {
        this._span.setTag(tag, value);
    };
    Span.prototype.setTags = function (tags) {
        var _this = this;
        Object.entries(tags).forEach(function (_a) {
            var tag = _a[0], value = _a[1];
            return _this.setTag(tag, value);
        });
    };
    Span.prototype.context = function () {
        return this._span.context();
    };
    Span.prototype.finish = function () {
        this._span.finish();
        this._setFinished(true);
    };
    Span.prototype._setFinished = function (finished) {
        this._finished = finished;
    };
    Span.prototype.isFinished = function () {
        return this._finished;
    };
    return Span;
}());
exports.default = Span;
