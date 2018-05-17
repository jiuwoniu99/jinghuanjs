'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

var _helper = require('../helper');

var _helper2 = _interopRequireDefault(_helper);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _define = require('../helper/define');

var _define2 = _interopRequireDefault(_define);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)(`JH:core/loader/middleware[${process.pid}]`);

let Middleware = class Middleware {
    constructor() {}

    createRegexp(match) {
        if (_helper2.default.isFunction(match)) {
            return match;
        }
        if (match) {
            return (0, _pathToRegexp2.default)(match);
        }
    }

    checkMatch(rule, ctx) {
        if (_helper2.default.isFunction(rule)) {
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
        let jhMid = _path2.default.join(jinghuan.JH_PATH, 'middleware', item.handle + '.js');
        let appMid = _path2.default.join(jinghuan.APP_PATH, 'common', 'middleware', item.handle + '.js');
        let nodeMid = 'jinghuan-middleware-' + item.handle;
        if (_fsExtra2.default.pathExistsSync(jhMid)) {
            middleware = jhMid;
        } else if (_fsExtra2.default.pathExistsSync(appMid)) {
            middleware = appMid;
        } else if (this.checkMid(nodeMid)) {
            middleware = nodeMid;
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
            if (_helper2.default.isString(item)) {
                return { handle: item };
            }
            if (_helper2.default.isFunction(item)) {
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
                if (_helper2.default.isString(item.handle)) {
                    this.requireMid(item);
                } else {
                    if (!_helper2.default.isEmpty(item.middleware)) {
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
            let filepath = _path2.default.join(jinghuan.ROOT_PATH, jinghuan.source, '/common/bootstrap/middleware.js');

            if (!_helper2.default.isFile(filepath)) {
                return [];
            }
            log(`load file: ${filepath}`);

            middlewares = _safeRequire(filepath);
        }
        let ms = [];
        middlewares.map((v, k) => {
            ms.push(v.handle);
        });
        (0, _define2.default)('middlewares', ms);
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

    return obj && obj.__esModule ? obj.default : obj;
}