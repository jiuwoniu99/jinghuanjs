'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

const path = _safeRequire('path');

const fs = _safeRequire('fs-extra');

const pathToRegexp = _safeRequire('path-to-regexp');

const helper = _safeRequire('../helper');

const define = _safeRequire('../helper/define');

const isFunction = _safeRequire('lodash/isFunction');

const isString = _safeRequire('lodash/isString');

const log = _safeRequire('debug')(`JH:core/loader/socket[${process.pid}]`);

let Middleware = class Middleware {
    constructor() {}

    createRegexp(match) {
        if (isFunction(match)) {
            return match;
        }
        if (match) {
            return pathToRegexp(match);
        }
    }

    checkMatch(rule, ctx) {
        if (isFunction(rule)) {
            return rule(ctx);
        }
        return rule.test(ctx.path);
    }

    checkMid(name) {
        try {
            return require.resolve(name, { paths: jinghuan.paths });
        } catch (e) {
            return false;
        }
    }

    requireMid(item) {
        let socket = "";
        let jhMid = path.join(jinghuan.JH_PATH, 'socket', item.handle + '.js');
        let appMid = path.join(jinghuan.APP_PATH, 'common', 'socket', item.handle + '.js');
        let nodeMid = 'jinghuan-socket-' + item.handle;
        if (fs.pathExistsSync(jhMid)) {
            socket = jhMid;
        } else if (fs.pathExistsSync(appMid)) {
            socket = appMid;
        } else if (this.checkMid(nodeMid)) {
            socket = this.checkMid(nodeMid);
        }
        let cache = require.cache[socket];
        let handle = null;
        if (!cache) {
            handle = _safeRequire(socket);
            if (handle) {
                item.socket = handle(item.options, jinghuan.app);
            }
        }
    }

    parse(sockets = []) {

        return sockets.map(item => {
            if (isString(item)) {
                return { handle: item };
            }
            if (isFunction(item)) {
                return { handle: () => item };
            }
            return item;
        }).filter(item => {
            return !('enable' in item) || item.enable;
        }).map(item => {
            const match = this.createRegexp(item.match);
            const ignore = this.createRegexp(item.ignore);

            if (jinghuan.mode === 'lib') {
                this.requireMid(item);
            }

            return (ctx, next) => {
                if (isString(item.handle)) {
                    this.requireMid(item);
                } else {
                    if (!helper.isEmpty(item.socket)) {
                        item.socket = item.handle(item.options, jinghuan.app);
                    }
                }

                if (match && !this.checkMatch(match, ctx) || ignore && this.checkMatch(ignore, ctx)) {
                    return next();
                }
                return item.socket(ctx, next);
            };
        });
    }

    load() {
        let sockets = jinghuan.config('socket');

        if (!sockets) {
            let filepath = path.join(jinghuan.ROOT_PATH, jinghuan.source, '/common/bootstrap/socket.js');

            if (!helper.isFile(filepath)) {
                return [];
            }
            log(`load file: ${filepath}`);

            sockets = _safeRequire(filepath);
        }
        let ms = [];
        sockets.map((v, k) => {
            ms.push(v.handle);
        });
        define('sockets', ms);
        return this.parse(sockets);
    }
};
exports.default = Middleware;

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}