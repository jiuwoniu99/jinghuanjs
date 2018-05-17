'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)('JH:extend/controller');
exports.default = {
    get body() {
        return this.ctx.body;
    },

    set body(value) {
        this.ctx.body = value;
    },

    get ip() {
        return this.ctx.ip;
    },

    get ips() {
        return this.ctx.ips;
    },

    get status() {
        return this.ctx.status;
    },

    set status(status) {
        this.ctx.status = status;
    },

    get type() {
        return this.ctx.type;
    },

    set type(contentType) {
        this.ctx.type = contentType;
    },

    get userAgent() {
        return this.ctx.userAgent;
    },

    get method() {
        return this.ctx.method;
    },

    get isGet() {
        return this.ctx.isGet;
    },

    get isPost() {
        return this.ctx.isPost;
    },

    config(name, value) {
        return jinghuan.config(name, value);
    },

    isMethod(method) {
        return this.ctx.isMethod(method);
    },

    isAjax(method) {
        return this.ctx.isAjax(method);
    },

    success(data, message) {
        return this.ctx.success(data, message);
    },

    fail(errno, errmsg, data) {
        return this.ctx.fail(errno, errmsg, data);
    },

    expires(time) {
        return this.ctx.expires(time);
    },

    get(name, value) {
        return this.ctx.param(name, value);
    },

    query(name, value) {
        return this.ctx.param(name, value);
    },

    post(name, value) {
        return this.ctx.post(name, value);
    },

    file(name, value) {
        return this.ctx.file(name, value);
    },

    cookie(name, value, options) {
        return this.ctx.cookie(name, value, options);
    },

    header(name, value) {
        if (value === undefined && (0, _isString2.default)(name)) {
            return this.ctx.header[name];
        }
        if (this.ctx.res.headersSent) {
            log(`headers has already sent, url: ${this.ctx.url}`);
            return;
        }
        if (value !== undefined) {
            return this.ctx.set(name, value);
        }
        if (helper.isObject(name)) {
            return this.ctx.set(name);
        }
    },

    referrer(onlyHost) {
        return this.ctx.referer(onlyHost);
    },

    referer(onlyHost) {
        return this.ctx.referer(onlyHost);
    },

    redirect(url, alt) {
        this.ctx.redirect(url, alt);
        return false;
    },

    download(filepath, filename) {
        return this.ctx.download(filepath, filename);
    },

    session(name, value, options) {
        return this.ctx.session(name, value, options);
    },

    db(a, b) {
        return this.ctx.db(a, b);
    },

    slog(msg) {
        this.ctx.slog.info(msg);
    }
};