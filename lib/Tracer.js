"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const opentracing_1 = require("opentracing");
const elastic_apm_node_1 = __importDefault(require("elastic-apm-node"));
const elastic_apm_node_opentracing_1 = __importDefault(require("elastic-apm-node-opentracing"));
const Span_1 = __importDefault(require("./Span"));
class Tracer {
    constructor(config) {
        this.serviceName = config.serviceName;
        this.secretToken = config.secretToken;
        this.serverUrl = config.serverUrl;
        console.log("Starting");
        this._agent = elastic_apm_node_1.default.start(config);
        this._tracer = new elastic_apm_node_opentracing_1.default(this._agent);
        this.Tags = opentracing_1.Tags;
        this._exceptions = exports.TracerExceptions;
    }
    startSpan(name) {
        if (!name) {
            throw new Error(this._exceptions.INVALID_SPAN_NAME);
        }
        return new Span_1.default(name, this._tracer.startSpan(name));
    }
    decorate(fn, spanName = fn.name) {
        const tracer = this;
        if (!spanName) {
            throw new Error(this._exceptions.INVALID_SPAN_NAME);
        }
        return function (...args) {
            console.log({ args });
            console.log("Span created", spanName);
            const span = tracer.startSpan(spanName);
            let fnReturn;
            try {
                fnReturn = fn.call(fn, ...args);
            }
            catch (e) {
                console.error(e);
                span._handleThrownError(e);
                return fnReturn;
            }
            span.finish();
            return fnReturn;
        };
    }
    decorateExpress(fn, spanName = fn.name) {
        if (!spanName) {
            throw new Error(this._exceptions.INVALID_SPAN_NAME);
        }
        const tracer = this;
        return function (req, res, next) {
            console.log("Span created", spanName);
            const span = tracer.startSpan(spanName);
            let fnReturn;
            try {
                fnReturn = fn.call(fn, req, res, next);
            }
            catch (e) {
                console.error(e);
                span._handleThrownError(e);
                return res.status(500).send(e.message || e);
            }
            const statusCode = res.statusCode;
            span.setTags({
                [tracer.Tags.COMPONENT]: 'express',
                [tracer.Tags.HTTP_METHOD]: req.method,
                [tracer.Tags.HTTP_URL]: req.url,
                [tracer.Tags.HTTP_STATUS_CODE]: statusCode
            });
            if (statusCode > 399) {
                span.logError(res.statusMessage);
            }
            res.on('finish', () => span.finish());
            return fnReturn;
        };
    }
}
exports.default = Tracer;
exports.TracerExceptions = {
    INVALID_SPAN_NAME: `A name for the span was not provided and it could not use it's own function's name. To properly name your span, please provide it as a second argument to the decorate functions. e.g.: tracer.decorate(myFunc, 'my-span-name')`,
};
