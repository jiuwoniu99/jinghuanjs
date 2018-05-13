import Koa from 'koa';
import bluebird from 'bluebird';
import assert from 'assert';
import log4js from 'log4js';
import jwt from 'jsonwebtoken';
import pkg from '../package.json';
import helper from './core/helper';
import c from './core/cluster';
import events from './core/events';
import pm2 from './core/pm2';


/**
 *
 * @type {helper}
 */
let jinghuan = Object.create(helper);

/**
 *
 * @type {Application|module.Application|*}
 */
let app = new Koa();

/**
 *
 * @type {bluebird}
 */
global.Promise = bluebird;

/**
 *
 * @type {helper}
 */
global.jinghuan = jinghuan;

Object.defineProperty(jinghuan, 'app', {
    get() {
        return app;
    }
});

Object.defineProperty(app, 'jinghuan', {
    get() {
        return jinghuan;
    }
});

Object.defineProperty(jinghuan, 'version', {
    get() {
        return pkg.version;
    }
});

Object.defineProperty(jinghuan, 'messenger', {
    get() {
        return c.messenger;
    }
});

class Controller {
};

Object.defineProperty(jinghuan, 'Controller', {
    get() {
        return Controller;
    }
});

/**
 * before start server
 * @type {Array}
 */
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

let pattern = '';

if (pm2.inPM2) {
    pattern = '%d{yyyy-MM-dd hh:mm:ss} [%6z] [%5.5p] - %m';
} else {
    pattern = '%[%d{yyyy-MM-dd hh:mm:ss} [%6z] [%5.5p] %] - %m';
}
/**
 *
 */
log4js.configure({
    appenders: {
        console: {
            type: 'console',
            layout: {type: 'pattern', pattern}
        }
    },
    categories: {
        default: {appenders: ['console'], level: 'all'}
    }
});

let logger = log4js.getLogger();

Object.defineProperty(jinghuan, 'logger', {
    get() {
        return logger;
    }
});

/**
 *
 * @type {Events}
 */
let es = new events();

/**
 *
 */
Object.defineProperty(jinghuan, 'events', {
    get() {
        return es;
    }
});

/**
 *
 */
Object.defineProperty(jinghuan, 'jwt', {
    get() {
        return jwt;
    }
});
