"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var opentracing_1 = require("opentracing");
var Span = /** @class */ (function () {
    function Span(name, span) {
        // ALIASES
        this.addTag = this.setTag.bind(this);
        this.addLabel = this.setTag.bind(this);
        this.setLabel = this.setTag.bind(this);
        this.addTags = this.setTags.bind(this);
        this.addLabels = this.setTags.bind(this);
        this.setLabels = this.setTags.bind(this);
        this.getLabel = this.getTag.bind(this);
        this.getLabels = this.getTags.bind(this);
        this.name = name;
        this._span = span;
        this._finished = false;
    }
    Span.prototype._sanitizeError = function (e) {
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
        try {
            this._span.log(payload);
        }
        catch (e) {
            console.log("Tá caindo aki");
            console.log('eroaki', { eroaki: e });
        }
    };
    Span.prototype.logError = function (error, kind) {
        error = this._sanitizeError(error);
        this.setTag(opentracing_1.Tags.ERROR, true);
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
    Span.prototype.getTag = function (tag) {
        return this._span._span._labels[tag];
    };
    Span.prototype.getTags = function () {
        return this._span._span._labels;
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
