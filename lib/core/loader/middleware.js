'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

const path = _safeRequire('path');

const fs = _safeRequire('fs-extra');

const pathToRegexp = _safeRequire('path-to-regexp');

const helper = _safeRequire('../helper');

const debug = _safeRequire('debug');

const define = _safeRequire('../helper/define');

const isFunction = _safeRequire('lodash/isFunction');

const isString = _safeRequire('lodash/isString');

const log = debug(`JH:core/loader/middleware[${process.pid}]`);

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
        let middleware = "";
        let jhMid = path.join(jinghuan.JH_PATH, 'middleware', item.handle + '.js');
        let appMid = path.join(jinghuan.APP_PATH, 'common', 'middleware', item.handle + '.js');
        let nodeMid = 'jinghuan-middleware-' + item.handle;
        if (fs.pathExistsSync(jhMid)) {
            middleware = jhMid;
        } else if (fs.pathExistsSync(appMid)) {
            middleware = appMid;
        } else if (this.checkMid(nodeMid)) {
            middleware = this.checkMid(nodeMid);
        }
        let cache = require.cache[middleware];
        let handle = null;
        if (!cache) {
            handle = _safeRequire(middleware);
            if (handle) {
                item.middleware = handle(item.options, jinghuan.app);
            }
        }
    }

    parse(middlewares = []) {

        return middlewares.map(item => {
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
                    if (!helper.isEmpty(item.middleware)) {
                        item.middleware = item.handle(item.options, jinghuan.app);
                    }
                }

                if (match && !this.checkMatch(match, ctx) || ignore && this.checkMatch(ignore, ctx)) {
                    return next();
                }
                return item.middleware(ctx, next);
            };
        });
    }

    load() {
        let middlewares = jinghuan.config('middleware');

        if (!middlewares) {
            let filepath = path.join(jinghuan.ROOT_PATH, jinghuan.source, '/common/bootstrap/middleware.js');

            if (!helper.isFile(filepath)) {
                return [];
            }
            log(`load file: ${filepath}`);

            middlewares = _safeRequire(filepath);
        }
        let ms = [];
        middlewares.map((v, k) => {
            ms.push(v.handle);
        });
        define('middlewares', ms);
        return this.parse(middlewares);
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