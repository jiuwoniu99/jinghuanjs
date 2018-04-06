'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//
var assert = require('assert');
//const _ = require('lodash');
//
var helper = require('../../helper');
//
var SESSION = Symbol('jinghuan-context-session');

/**
 * default session options
 */
var defaultOptions = {
    maxAge: 24 * 3600 * 1000 //1 day
};
/**
 * default cookie options
 * https://github.com/pillarjs/cookies#cookiesset-name--value---options--
 */
var defaultCookieOptions = {
    name: 'JHSESSID',
    autoUpdate: false, //auto update cookie when is set maxAge
    path: '/', //a string indicating the path of the cookie
    httpOnly: true,
    sameSite: false,
    signed: false,
    overwrite: false,
    encrypt: false //encrypt cookie data
    //maxAge: '',
    //expires: '',
    //domain: '',
    //secure: false,
    //keys: []
};

/**
 * Session Manage
 */

var Session = function () {
    /**
     * constructor
     * @param {Object} ctx context
     * @param {Object} options session options
     */
    function Session(ctx, options) {
        _classCallCheck(this, Session);

        this.ctx = ctx;
        var sessionConfig = helper.parseAdapterConfig(ctx.config('session'), options);
        this.options = helper.extend({}, defaultOptions, sessionConfig);
        assert(helper.isFunction(this.options.handle), 'session.handle must be a function');
        this.cookieOptions = Object.assign({}, defaultCookieOptions, ctx.config('cookie'), this.options.cookie);
    }

    /**
     * get session instance
     */


    Session.prototype.getSessionInstance = function getSessionInstance() {
        if (!this.ctx[SESSION]) {
            var handle = this.options.handle;
            var instance = void 0;
            //store session data on cookie
            if (handle.onlyCookie) {
                instance = new handle(this.cookieOptions, this.ctx);
            } else {
                var name = this.cookieOptions.name;
                var cookie = this.ctx.cookie(name, undefined, this.cookieOptions);
                var fresh = false;
                if (!cookie) {
                    cookie = helper.uuid();
                    this.ctx.cookie(name, cookie, this.cookieOptions);
                    fresh = true;
                } else {
                    var cookieOptions = this.cookieOptions;
                    //auto update cookie when expires or maxAge is set
                    if (cookieOptions.autoUpdate && cookieOptions.maxAge) {
                        this.ctx.cookie(name, cookie, this.cookieOptions);
                    }
                }
                //transform humanize time to ms
                this.options.maxAge = helper.ms(this.options.maxAge);
                this.options.cookie = cookie;
                this.options.fresh = fresh;
                instance = new handle(this.options, this.ctx);
            }
            this.ctx[SESSION] = instance;
        }
        return this.ctx[SESSION];
    };

    /**
     *
     * @param name
     * @param value
     */


    Session.prototype.run = function run(name, value) {
        var instance = this.getSessionInstance();
        //delete session
        if (name === null) {
            return Promise.resolve(instance.delete());
        }
        //get session
        if (value === undefined) {
            return Promise.resolve(instance.get(name));
        }
        assert(helper.isString(name), 'session.name must be a string');
        //set session
        return Promise.resolve(instance.set(name, value));
    };

    return Session;
}();

module.exports = Session;