"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var opentracing_1 = require("opentracing");
var elastic_apm_node_1 = __importDefault(require("elastic-apm-node"));
var elastic_apm_node_opentracing_1 = __importDefault(require("elastic-apm-node-opentracing"));
var Span_1 = __importDefault(require("./Span"));
var Tracer = /** @class */ (function () {
    function Tracer(config) {
        this.serviceName = config.serviceName;
        this.secretToken = config.secretToken;
        this.serverUrl = config.serverUrl;
        // console.log("Starting")
        this._agent = elastic_apm_node_1.default.start(config);
        this._tracer = new elastic_apm_node_opentracing_1.default(this._agent);
        this.Tags = opentracing_1.Tags;
        this._exceptions = exports.TracerExceptions;
    }
    Tracer.prototype.startSpan = function (name) {
        if (!name) {
            throw new Error(this._exceptions.INVALID_SPAN_NAME);
        }
        return new Span_1.default(name, this._tracer.startSpan(name));
    };
    Tracer.prototype.decorate = function (fn, spanName) {
        if (spanName === void 0) { spanName = fn.name; }
        var tracer = this;
        if (!spanName) {
            throw new Error(this._exceptions.INVALID_SPAN_NAME);
        }
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var span = tracer.startSpan(spanName);
            var fnReturn;
            try {
                fnReturn = fn.call.apply(fn, __spreadArrays([fn], args));
                if (fnReturn instanceof Promise) {
                    return fnReturn
                        .then(function (resolved) {
                        span.finish();
                        return resolved;
                    })
                        .catch(span._handleThrownError);
                }
            }
            catch (e) {
                console.error(e);
                span._handleThrownError(e);
                return fnReturn;
            }
            span.finish();
            return fnReturn;
        };
    };
    Tracer.prototype.decorateExpress = function (fn, spanName) {
        if (spanName === void 0) { spanName = fn.name; }
        if (!spanName) {
            throw new Error(this._exceptions.INVALID_SPAN_NAME);
        }
        var tracer = this;
        return function (req, res, next) {
            // console.log("Span created", spanName)
            var _a;
            var span = tracer.startSpan(spanName);
            var fnReturn;
            try {
                fnReturn = fn.call(fn, req, res, next);
            }
            catch (e) {
                console.error(e);
                span._handleThrownError(e);
                return res.status(500).send(e.message || e);
            }
            var statusCode = res.statusCode;
            span.addTags((_a = {},
                _a[tracer.Tags.COMPONENT] = 'express',
                _a[tracer.Tags.HTTP_METHOD] = req.method,
                _a[tracer.Tags.HTTP_URL] = req.url,
                _a[tracer.Tags.HTTP_STATUS_CODE] = statusCode,
                _a));
            if (statusCode > 399) {
                span.logError(res.statusMessage);
            }
            res.on('finish', function () { return span.finish(); });
            return fnReturn;
        };
    };
    return Tracer;
}());
exports.default = Tracer;
exports.TracerExceptions = {
    INVALID_SPAN_NAME: "A name for the span was not provided and it could not use it's own function's name. To properly name your span, please provide it as a second argument to the decorate functions. e.g.: tracer.decorate(myFunc, 'my-span-name')",
};
