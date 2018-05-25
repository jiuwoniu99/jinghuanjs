import path from "path";
import fs from "fs";
import assert from "assert";
import Cookies from "cookies";
import url from "url";
import onFinished from "on-finished";
import destroy from "destroy";
import helper from "../core/helper";
import Slog from "../core/slog";
import knex from "../core/knex";
import session from "../core/session";
import events from '../core/events';
import isArray from 'lodash/isArray'
import isString from 'lodash/isString';
import get from 'lodash/get'
import set from 'lodash/set'
//
const PARAM = Symbol('context-param');
const POST = Symbol('context-post');
const FILE = Symbol('context-file');
const COOKIE_STORE = Symbol('cookie-store');

/**
 * extend context
 */
export default {
    /**
     *
     * @return {*}
     */
    get userAgent() {
        return this.header['user-agent'];
    },
    
    /**
     *
     * @return {boolean}
     */
    get isGet() {
        return this.method === 'GET';
    },
    
    /**
     *
     * @return {boolean}
     */
    get isPost() {
        return this.method === 'POST';
    },
    /**
     *
     * @return {boolean}
     */
    get isSocket() {
        return this.websocket != null;
    },
    /**
     * get referer header
     */
    referer(onlyHost) {
        return this.referrer(onlyHost);
    },
    /**
     * get referer header
     */
    referrer(onlyHost) {
        const referrer = this.header['referer'];
        if (!referrer || !onlyHost) {
            return referrer;
        }
        return url.parse(referrer).hostname;
    },
    /**
     * is method
     */
    isMethod(method) {
        return this.method === method.toUpperCase();
    },
    /**
     * is ajax request
     */
    isAjax(method) {
        if (method && !this.isMethod(method)) {
            return false;
        }
        return this.header['x-requested-with'] === 'XMLHttpRequest';
    },
    /**
     * set expires header
     */
    expires(time) {
        time = helper.ms(time);
        const date = new Date(Date.now() + time);
        this.set('Cache-Control', `max-age=${time}`);
        this.set('Expires', date.toUTCString());
    },
    /**
     * get or set configs
     * @param {String} name
     * @param {Mixed} value
     */
    config(name, value) {
        return jinghuan.config(name, value);
    },
    
    /**
     * get or set query data
     * `query` or `get` is already used in koa
     * @param {String} name
     */
    param(name) {
        if (!this[PARAM]) {
            this[PARAM] = Object.assign({}, this.request._query || this.request.query);
        }
        if (!name) {
            return this[PARAM];
        }
        return get(this[PARAM], name, {});
    },
    /**
     * get or set post data
     * @param {String} name
     */
    post(name) {
        if (!this[POST]) {
            this[POST] = this.request.body && this.request.body.post;
        }
        if (!name) {
            return this[POST];
        }
        return get(this[POST], name, {});
    },
    /**
     * get or set file data
     * @param {String} name
     * @param {Mixed} value
     */
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
    /**
     * get or set cookie
     * @param {String} name
     * @param {String} value
     * @param {Object} options
     */
    cookie(name, value, options = {}) {
        if (name == null && value == null) {
            return this.cookies.get();
        }
        if (value == null) {
            return this.cookies.get(name);
        }
        this.cookies.set(name, value, options)
    },
    
    /**
     * download
     * @param {String} filepath
     * @param {String} filename
     */
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
    /**
     *
     * @return {Slog}
     */
    get slog() {
        if (!this._slog) {
            this._slog = new Slog(this);
        }
        return this._slog;
    },
    /**
     *
     * @return {Function}
     */
    get db() {
        return knex;
    },
    /**
     * session 预留功能由中间件完成
     * @return {Function}
     */
    get session() {
        return async (name, value, option) => {
        };
    },
    /**
     *
     * @return {events|Events}
     */
    get events() {
        if (!this._events) {
            this._events = new events();
        }
        return this._events;
    },
    
    /**
     * cache 预留功能由中间件完成
     * @return {Function}
     */
    get cache() {
        return async (name, value, option) => {
        };
    }
};
