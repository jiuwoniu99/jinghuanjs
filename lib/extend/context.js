'use strict';

var path = require('path');
var fs = require('fs');
//
var assert = require('assert');
var Cookies = require('cookies');
var url = require('url');
var onFinished = require('on-finished');
var destroy = require('destroy');
//const _ = require('lodash');
//
var helper = require('../core/helper');
var Slog = require('../core/slog');
var knex = require('../core/knex');
var session = require('../core/session');
//
var PARAM = Symbol('context-param');
var POST = Symbol('context-post');
var FILE = Symbol('context-file');
var COOKIE_STORE = Symbol('cookie-store');

/**
 * extend context
 */
module.exports = {
    /**
     * get userAgent header
     */
    get userAgent() {
        return this.header['user-agent'];
    },
    /**
     * is get request
     */
    get isGet() {
        return this.method === 'GET';
    },
    /**
     * is post request
     */
    get isPost() {
        return this.method === 'POST';
    },
    /**
     * is command line invoke
     */
    get isCli() {
        return this.method === 'CLI';
    },
    /**
     * get referer header
     */
    referer: function referer(onlyHost) {
        return this.referrer(onlyHost);
    },

    /**
     * get referer header
     */
    referrer: function referrer(onlyHost) {
        var referrer = this.header['referer'];
        if (!referrer || !onlyHost) {
            return referrer;
        }
        return url.parse(referrer).hostname;
    },

    /**
     * is method
     */
    isMethod: function isMethod(method) {
        return this.method === method.toUpperCase();
    },

    /**
     * is ajax request
     */
    isAjax: function isAjax(method) {
        if (method && !this.isMethod(method)) {
            return false;
        }
        return this.header['x-requested-with'] === 'XMLHttpRequest';
    },

    /**
     * is jsonp request
     */
    isJsonp: function isJsonp() {
        var callbackField = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.config('jsonpCallbackField');

        return !!this.param(callbackField);
    },

    /**
     * send jsonp data
     */
    jsonp: function jsonp(data) {
        var callbackField = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.config('jsonpCallbackField');

        var field = this.param(callbackField);
        // remove unsafe chars
        field = (field || '').replace(/[^\w.]/g, '');
        if (field) {
            data = field + '(' + JSON.stringify(data) + ')';
        }
        this.type = this.config('jsonpContentType');
        this.body = data;
        return false;
    },

    /**
     * send json data
     */
    json: function json(data) {
        this.type = this.config('jsonContentType');
        this.body = data;
        return false;
    },

    /**
     * send success data
     */
    success: function success() {
        var _obj;

        var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

        var obj = (_obj = {}, _obj[this.config('errnoField')] = 0, _obj[this.config('errmsgField')] = message, _obj.data = data, _obj);
        this.type = this.config('jsonContentType');
        this.body = obj;
        return false;
    },

    /**
     * send fail data
     */
    fail: function fail(errno) {
        var errmsg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

        var obj = void 0;
        if (helper.isObject(errno)) {
            obj = errno;
        } else {
            var _obj2;

            if (/^[A-Z_]+$/.test(errno)) {
                var messages = jinghuan.app.validators.messages || {};
                var msg = messages[errno];
                if (jinghuan.isArray(msg)) {
                    errno = msg[0];
                    errmsg = msg[1];
                }
            }
            if (!jinghuan.isNumber(errno)) {
                var _ref = [errmsg, errno, this.config('defaultErrno')];
                data = _ref[0];
                errmsg = _ref[1];
                errno = _ref[2];
            }
            obj = (_obj2 = {}, _obj2[this.config('errnoField')] = errno, _obj2[this.config('errmsgField')] = errmsg, _obj2);
            if (data) {
                obj.data = data;
            }
        }
        this.type = this.config('jsonContentType');
        this.body = obj;
        return false;
    },

    /**
     * set expires header
     */
    expires: function expires(time) {
        time = helper.ms(time);
        var date = new Date(Date.now() + time);
        this.set('Cache-Control', 'max-age=' + time);
        this.set('Expires', date.toUTCString());
    },

    /**
     * get or set configs
     * @param {String} name
     * @param {Mixed} value
     * @param {String} m
     */
    config: function config(name, value) {
        var m = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.module;

        return jinghuan.config(name, value, m);
    },

    /**
     * get or set query data
     * `query` or `get` is already used in koa
     * @param {String} name
     * @param {Mixed} value
     */
    param: function param(name, value) {
        var _this = this;

        if (!this[PARAM]) {
            this[PARAM] = Object.assign({}, this.request._query || this.request.query);
            this.app.emit('filterParam', this[PARAM]);
        }
        if (!name) {
            return this[PARAM];
        }
        if (helper.isObject(name)) {
            this[PARAM] = Object.assign(this[PARAM], name);
            return this;
        }
        if (value === undefined) {
            // this.param('a,b')
            if (helper.isString(name) && name.indexOf(',') > -1) {
                name = name.split(',');
            }
            if (helper.isArray(name)) {
                var _value = {};
                name.forEach(function (item) {
                    var val = _this[PARAM][item];
                    if (val !== undefined) {
                        _value[item] = val;
                    }
                });
                return _value;
            }
            return this[PARAM][name];
        }
        this[PARAM][name] = value;
        return this;
    },

    /**
     * get or set post data
     * @param {String} name
     * @param {Mixed} value
     */
    post: function post(name, value) {
        var _this2 = this;

        if (!this[POST]) {
            var json = this.request.body && this.request.body.post;
            this[POST] = jinghuan.isArray(json) ? Array.from(json) : Object.assign({}, json);
            this.app.emit('filterParam', this[POST]);
        }
        if (!name) {
            return this[POST];
        }
        if (helper.isObject(name)) {
            this[POST] = Object.assign(this[POST], name);
            return this;
        }
        if (value === undefined) {
            // this.param('a,b')
            if (helper.isString(name) && name.indexOf(',') > -1) {
                name = name.split(',');
            }
            if (helper.isArray(name)) {
                var _value2 = {};
                name.forEach(function (item) {
                    var val = _this2[POST][item];
                    if (val !== undefined) {
                        _value2[item] = val;
                    }
                });
                return _value2;
            }
            return this[POST][name];
        }
        this[POST][name] = value;
        return this;
    },

    /**
     * get or set file data
     * @param {String} name
     * @param {Mixed} value
     */
    file: function file(name, value) {
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

    /**
     * get or set cookie
     * @param {String} name
     * @param {String} value
     * @param {Object} options
     */
    cookie: function cookie(name, value) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        assert(name && helper.isString(name), 'cookie.name must be a string');
        options = Object.assign({}, this.config('cookie'), options);
        var instance = new Cookies(this.req, this.res, {
            keys: options.keys,
            secure: this.request.secure
        });

        if (!this[COOKIE_STORE]) {
            this[COOKIE_STORE] = {};
        }

        // get cookie
        if (value === undefined) {
            if (this[COOKIE_STORE][name] !== undefined) {
                return this[COOKIE_STORE][name];
            }
            return instance.get(name, options);
        }
        // remove cookie
        if (value === null) {
            delete this[COOKIE_STORE][name];
            // If the value is omitted, an outbound header with an expired date is used to delete the cookie.
            // https://github.com/pillarjs/cookies#cookiesset-name--value---options--
            return instance.set(name, undefined, options);
        }
        assert(helper.isString(value), 'cookie value must be a string');
        // http://browsercookielimits.squawky.net/
        if (value.length >= 4094) {
            this.app.emit('cookieLimit', { name: name, value: value, ctx: this });
        }
        this[COOKIE_STORE][name] = value;
        // set cookie
        return instance.set(name, value, options);
    },

    /**
     * get service
     * @param {String} name
     * @param {String} m
     */
    service: function service() {
        var _jinghuan;

        return (_jinghuan = jinghuan).service.apply(_jinghuan, arguments);
    },

    /**
     * download
     * @param {String} filepath
     * @param {String} filename
     */
    download: function download(filepath) {
        var filename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : path.basename(filepath);

        assert(filepath, 'filepath can not be empty');
        var contentType = this.response.get('Content-Type');
        if (!contentType) {
            this.type = path.extname(filename);
        }
        var contentDisposition = this.response.get('Content-Disposition');
        if (!contentDisposition) {
            this.attachment(filename);
        }
        var stream = fs.createReadStream(filepath);
        this.body = stream;
        onFinished(this.res, function () {
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
    db: knex,
    session: session
};