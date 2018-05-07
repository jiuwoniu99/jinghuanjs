import Koa from "koa"
import bluebird from "bluebird"
import assert from "assert"
import log4js from "log4js"
import jwt from "jsonwebtoken"
import pkg from "../package.json"
import helper from "./core/helper"

const messenger = require('./core/cluster').messenger;

import events from "./core/events"

/**
 * use bluebird instead of default Promise
 */
global.Promise = bluebird;

/**
 * global jinghuan object
 * @type {Object}
 */
global.jinghuan = Object.create(helper);

/**
 * Koa application instance
 * @type {Koa}
 */
jinghuan.app = new Koa();

/**
 * add jinghuan to jinghuan.app
 */
// jinghuan.app.jinghuan = jinghuan;

/**
 * version
 */
jinghuan.version = pkg.version;

/**
 * messenger
 * @type {Object}
 */
jinghuan.messenger = messenger;

/**
 * base controller class
 */
jinghuan.Controller = class Controller {
}

/**
 * base logic class
 */
//jinghuan.Logic = class Logic extends jinghuan.Controller {
//};

/**
 * service base class
 */
//jinghuan.Service = class Service {
//};

/**
 * get service
 */
//jinghuan.service = (name, m, ...args) => {
//	let mcls = jinghuan.app.services;
//	if (jinghuan.app.modules.length) {
//		mcls = jinghuan.app.services[m || 'common'] || {};
//	} else {
//		args.unshift(m);
//	}
//	const Cls = mcls[name];
//	assert(Cls, `can not find service: ${name}`);
//	if (helper.isFunction(Cls)) return new Cls(...args);
//	return Cls;
//};

// before start server
const promises = [];

/**
 *
 * @param fn
 * @return {*}
 */
jinghuan.beforeStartServer = fn => {
    if (fn) {
        assert(helper.isFunction(fn), 'fn in jinghuan.beforeStartServer must be a function');
        return promises.push(fn());
    }
    const promise = Promise.all(promises);
    const timeout = helper.ms(jinghuan.config('startServerTimeout'));
    const timeoutPromise = helper.timeout(timeout).then(() => {
        const err = new Error(`waiting for start server timeout, time: ${timeout}ms`);
        return Promise.reject(err);
    });
    return Promise.race([promise, timeoutPromise]);
};

/**
 *
 */
log4js.configure({
    appenders: {
        console: {
            type: 'console',
            layout: {type: 'pattern', pattern: '%[%d{yyyy-MM-dd hh:mm:ss} [%6z] [%5.5p] %] - %m'}
        }
    },
    categories: {
        default: {appenders: ['console'], level: 'all'}
    }
});

/**
 *
 * @type {Logger}
 */
jinghuan.logger = log4js.getLogger();

/**
 *
 * @type {Events}
 */
jinghuan.events = new events();

/**
 *
 */
Object.defineProperty(jinghuan, 'jwt', {
    get() {
        return jwt;
    }
});
