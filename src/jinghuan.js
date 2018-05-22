import Koa from 'koa';
import bluebird from 'bluebird';
//import assert from 'assert';
import log4js from 'log4js';
import jwt from 'jsonwebtoken';
import pkg from '../package.json';
import helper from './core/helper';
import c from './core/cluster';
import events from './core/events';
//import pm2 from './core/pm2';
import define from './core/helper/define';
//import isFunction from 'lodash/isFunction'
//import IO from 'koa-socket-2';
//import cluster from 'cluster';
/**
 *
 * @type {helper}
 */
let jh = Object.create(helper);

/**
 *
 * @type {Application|module.Application|*}
 */
//let app = new Koa();


//if(cluster.isMaster){
//    let io = new IO();
//    io.on('message', (ctx, data) => {
//        console.log('client sent data to message endpoint', data);
//    });
//    io.attach(app);
//}

/**
 *
 * @type {bluebird}
 */
global.Promise = bluebird;


Object.defineProperty(global, 'jinghuan', {
    get() {
        return jh;
    }
});

//Object.defineProperty(app, 'jinghuan', {
//    get() {
//        return jh;
//    }
//});

//define('app', app);
define('version', pkg.version);
define('messenger', c.messenger);
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

let pattern = '';

//if (pm2.inPM2) {
pattern = '%d{yyyy-MM-dd hh:mm:ss} [%6z] [%5.5p] - %m';
//} else {
//    pattern = '%[%d{yyyy-MM-dd hh:mm:ss} [%6z] [%5.5p] %] - %m';
//}
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
