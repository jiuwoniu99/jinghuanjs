'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

const keys = _safeRequire('lodash/keys');

const remove = _safeRequire('lodash/remove');

const isEmpty = _safeRequire('lodash/isEmpty');

let Response = class Response {
    constructor() {
        this._headers = {};
    }

    setHeader(name, value) {
        this._headers[name] = value;
    }

    getHeader(name) {
        return this._headers[name];
    }

    getHeaderNames() {
        return keys(this._headers);
    }

    getHeaders() {
        return this._headers;
    }

    hasHeader(name) {
        return !isEmpty(this._headers[name]);
    }

    removeHeader(name) {
        delete this._headers[name];
    }

};
exports.default = Response;

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}