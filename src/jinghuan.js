import bluebird from 'bluebird';
import log4js from 'log4js';
import jwt from 'jsonwebtoken';
import pkg from '../package.json';
import helper from './core/helper';
import c from './core/cluster';
import events from './core/events';
import define from './core/helper/define';
import valid from './core/vlaid';


/**
 *
 * @type {bluebird}
 */
global.Promise = bluebird;

define('jinghuan', Object.create(helper), global);
define('version', pkg.version);
define('messenger', c.messenger);
define('valid', new valid());
define('Controller', class Controller {
});

/**
 * before start server
 * @type {Array}
 */
//const promises = [];

/**
 *
 * @param fn
 * @return {*}
 */
//jinghuan.beforeStartServer = fn => {
//    if (fn) {
//        assert(helper.isFunction(fn), 'fn in jinghuan.beforeStartServer must be a function');
//        return promises.push(fn());
//    }
//    const promise = Promise.all(promises);
//    const timeout = helper.ms(jinghuan.config('startServerTimeout'));
//    const timeoutPromise = helper.timeout(timeout).then(() => {
//        const err = new Error(`waiting for start server timeout, time: ${timeout}ms`);
//        return Promise.reject(err);
//    });
//    return Promise.race([promise, timeoutPromise]);
//};

let pattern = '%d{yyyy-MM-dd hh:mm:ss} [%6z] [%5.5p] - %m';

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

define('logger', log4js.getLogger());
define('events', new events());
define('jwt', jwt);
