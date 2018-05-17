"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _cookies = require("cookies");

var _cookies2 = _interopRequireDefault(_cookies);

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

var _onFinished = require("on-finished");

var _onFinished2 = _interopRequireDefault(_onFinished);

var _destroy = require("destroy");

var _destroy2 = _interopRequireDefault(_destroy);

var _helper = require("../core/helper");

var _helper2 = _interopRequireDefault(_helper);

var _slog = require("../core/slog");

var _slog2 = _interopRequireDefault(_slog);

var _knex = require("../core/knex");

var _knex2 = _interopRequireDefault(_knex);

var _session = require("../core/session");

var _session2 = _interopRequireDefault(_session);

var _events = require("../core/events");

var _events2 = _interopRequireDefault(_events);

var _isArray = require("lodash/isArray");

var _isArray2 = _interopRequireDefault(_isArray);

var _isString = require("lodash/isString");

var _isString2 = _interopRequireDefault(_isString);

var _get = require("lodash/get");

var _get2 = _interopRequireDefault(_get);

var _set = require("lodash/set");

var _set2 = _interopRequireDefault(_set);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
        return _url2.default.parse(referrer).hostname;
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
        time = _helper2.default.ms(time);
        const date = new Date(Date.now() + time);
        this.set('Cache-Control', `max-age=${time}`);
        this.set('Expires', date.toUTCString());
    },

    config(name, value) {
        return jinghuan.config(name, value);
    },

    param(name, value) {
        if (!this[PARAM]) {
            this[PARAM] = Object.assign({}, this.request._query || this.request.query);
        }
        if (!name) {
            return this[PARAM];
        }
        return (0, _get2.default)(this[PARAM], name);
    },

    post(name) {
        if (!this[POST]) {
            this[POST] = this.request.body && this.request.body.post;
        }
        if (!name) {
            return this[POST];
        }
        return (0, _get2.default)(this[POST], name);
    },

    file(name, value) {
        if (!this[FILE]) {
            this[FILE] = Object.assign({}, this.request.body && this.request.body.file);
        }
        if (!name) {
            return this[FILE];
        }
        if (_helper2.default.isObject(name)) {
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

    download(filepath, filename = _path2.default.basename(filepath)) {
        (0, _assert2.default)(filepath, 'filepath can not be empty');
        const contentType = this.response.get('Content-Type');
        if (!contentType) {
            this.type = _path2.default.extname(filename);
        }
        const contentDisposition = this.response.get('Content-Disposition');
        if (!contentDisposition) {
            this.attachment(filename);
        }
        const stream = _fs2.default.createReadStream(filepath);
        this.body = stream;
        (0, _onFinished2.default)(this.res, () => {
            (0, _destroy2.default)(stream);
        });
        return false;
    },

    get slog() {
        if (!this._slog) {
            this._slog = new _slog2.default(this);
        }
        return this._slog;
    },

    get db() {
        return _knex2.default;
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
            this._events = new _events2.default();
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