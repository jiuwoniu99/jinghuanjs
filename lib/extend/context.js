"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const path = _safeRequire("path");

const fs = _safeRequire("fs");

const assert = _safeRequire("assert");

const Cookies = _safeRequire("cookies");

const url = _safeRequire("url");

const onFinished = _safeRequire("on-finished");

const destroy = _safeRequire("destroy");

const helper = _safeRequire("../core/helper");

const Slog = _safeRequire("../core/slog");

const knex = _safeRequire("../core/knex");

const session = _safeRequire("../core/session");

const events = _safeRequire("../core/events");

const isArray = _safeRequire("lodash/isArray");

const isString = _safeRequire("lodash/isString");

const get = _safeRequire("lodash/get");

const set = _safeRequire("lodash/set");

const PARAM = Symbol('context-param');
const POST = Symbol('context-post');
const FILE = Symbol('context-file');
const COOKIE_STORE = Symbol('cookie-store');

exports.default = {
    get userAgent() {
        return this.header['user-agent'];
    },

    get isGet() {
        return this.method === 'GET';
    },

    get isPost() {
        return this.method === 'POST';
    },

    referer(onlyHost) {
        return this.referrer(onlyHost);
    },

    referrer(onlyHost) {
        const referrer = this.header['referer'];
        if (!referrer || !onlyHost) {
            return referrer;
        }
        return url.parse(referrer).hostname;
    },

    isMethod(method) {
        return this.method === method.toUpperCase();
    },

    isAjax(method) {
        if (method && !this.isMethod(method)) {
            return false;
        }
        return this.header['x-requested-with'] === 'XMLHttpRequest';
    },

    expires(time) {
        time = helper.ms(time);
        const date = new Date(Date.now() + time);
        this.set('Cache-Control', `max-age=${time}`);
        this.set('Expires', date.toUTCString());
    },

    config(name, value) {
        return jinghuan.config(name, value);
    },

    param(name) {
        if (!this[PARAM]) {
            this[PARAM] = Object.assign({}, this.request._query || this.request.query);
        }
        if (!name) {
            return this[PARAM];
        }
        return get(this[PARAM], name, {});
    },

    post(name) {
        if (!this[POST]) {
            this[POST] = this.request.body && this.request.body.post;
        }
        if (!name) {
            return this[POST];
        }
        return get(this[POST], name, {});
    },

    file(name, value) {
        if (!this[FILE]) {
            this[FILE] = Object.assign({}, this.request.body && this.request.body.file);
        }
        if (!name) {
            return this[FILE];
        }
        if (helper.isObject(name)) {
            this[FILE] = Object.assign(this[FILE], name);
            return this;
        }
        if (value === undefined) {
            return this[FILE][name];
        }
        this[FILE][name] = value;
        return this;
    },

    cookie(name, value, options = {}) {
        if (name == null && value == null) {
            return this.cookies.get();
        }
        if (value == null) {
            return this.cookies.get(name);
        }
        this.cookies.set(name, value, options);
    },

    download(filepath, filename = path.basename(filepath)) {
        assert(filepath, 'filepath can not be empty');
        const contentType = this.response.get('Content-Type');
        if (!contentType) {
            this.type = path.extname(filename);
        }
        const contentDisposition = this.response.get('Content-Disposition');
        if (!contentDisposition) {
            this.attachment(filename);
        }
        const stream = fs.createReadStream(filepath);
        this.body = stream;
        onFinished(this.res, () => {
            destroy(stream);
        });
        return false;
    },

    get slog() {
        if (!this._slog) {
            this._slog = new Slog(this);
        }
        return this._slog;
    },

    get db() {
        return knex;
    },

    get session() {
        return (() => {
            var _ref = _asyncToGenerator(function* (name, value, option) {});

            return function (_x, _x2, _x3) {
                return _ref.apply(this, arguments);
            };
        })();
    },

    get events() {
        if (!this._events) {
            this._events = new events();
        }
        return this._events;
    },

    get cache() {
        return (() => {
            var _ref2 = _asyncToGenerator(function* (name, value, option) {});

            return function (_x4, _x5, _x6) {
                return _ref2.apply(this, arguments);
            };
        })();
    }
};

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