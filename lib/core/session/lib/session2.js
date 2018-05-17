"use strict";

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _helper = require("../../helper");

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SESSION = Symbol('jinghuan-context-session');

const defaultOptions = {
    maxAge: 24 * 3600 * 1000 };

const defaultCookieOptions = {
    name: 'JHSESSID',
    autoUpdate: false,
    path: '/',
    httpOnly: true,
    sameSite: false,
    signed: false,
    overwrite: false,
    encrypt: false };

let Session = class Session {
    constructor(ctx, options) {
        this.ctx = ctx;
        const sessionConfig = _helper2.default.parseAdapterConfig(ctx.config('session'), options);
        this.options = _helper2.default.extend({}, defaultOptions, sessionConfig);
        (0, _assert2.default)(_helper2.default.isFunction(this.options.handle), 'session.handle must be a function');
        this.cookieOptions = Object.assign({}, defaultCookieOptions, ctx.config('cookie'), this.options.cookie);
    }

    getSessionInstance() {
        if (!this.ctx[SESSION]) {
            const handle = this.options.handle;
            let instance;

            if (handle.onlyCookie) {
                instance = new handle(this.cookieOptions, this.ctx);
            } else {
                let name = this.cookieOptions.name;
                let cookie = this.ctx.cookie(name, undefined, this.cookieOptions);
                let fresh = false;
                if (!cookie) {
                    cookie = _helper2.default.uuid();
                    this.ctx.cookie(name, cookie, this.cookieOptions);
                    fresh = true;
                } else {
                    const cookieOptions = this.cookieOptions;

                    if (cookieOptions.autoUpdate && cookieOptions.maxAge) {
                        this.ctx.cookie(name, cookie, this.cookieOptions);
                    }
                }

                this.options.maxAge = _helper2.default.ms(this.options.maxAge);
                this.options.cookie = cookie;
                this.options.fresh = fresh;
                instance = new handle(this.options, this.ctx);
            }
            this.ctx[SESSION] = instance;
        }
        return this.ctx[SESSION];
    }

    run(name, value) {
        const instance = this.getSessionInstance();

        if (name === null) {
            return Promise.resolve(instance.delete());
        }

        if (value === undefined) {
            return Promise.resolve(instance.get(name));
        }
        (0, _assert2.default)(_helper2.default.isString(name), 'session.name must be a string');

        return Promise.resolve(instance.set(name, value));
    }
};


module.exports = Session;