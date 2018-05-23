'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

const debug = _safeRequire('debug');

const path = _safeRequire('path');

const assert = _safeRequire('assert');

const helper = _safeRequire('../core/helper');

const send = _safeRequire('koa-send');

const isString = _safeRequire('lodash/isString');

const log = debug(`JH:middleware/resource[${process.pid}]`);

const defaultOptions = {
    root: '',
    publicPath: '/',
    index: 'index.html',
    hidden: false,
    format: true,
    gzip: false,
    extensions: false,
    maxage: 0,
    setHeaders: false,
    notFoundNext: false
};

const prefixPath = path => {
    if (isString(path) && !path.startsWith('/')) {
        path = '/' + path;
    }
    return path;
};

const matchRoute = (path, route) => {
    if (helper.isRegExp(route)) {
        return path.match(route);
    }
    if (isString(route)) {
        route = route.split('/');
        path = path.split(/\/+/);
        return route.every((item, index) => {
            if (!item || item === path[index]) {
                return true;
            }
        });
    }
};

function MidResource(options, app) {
    options = helper.extend({}, defaultOptions, options || {});

    const root = options.root;
    assert(root, 'root directory is required to serve files');
    log('static "%s" %j', root, options);
    options.root = path.resolve(root);

    let publicPath = options.publicPath;
    assert(helper.isRegExp(publicPath) || isString(publicPath), 'publicPath must be regexp or string');
    options.publicPath = prefixPath(publicPath);

    const notFoundNext = options.notFoundNext;

    return function serve(ctx, next) {
        if (matchRoute(ctx.path, options.publicPath) && (ctx.method === 'HEAD' || ctx.method === 'GET')) {
            return send(ctx, prefixPath(ctx.path), options).then(done => {
                if (!done && notFoundNext) {
                    return next();
                }
            });
        }
        return next();
    };
};

exports.default = MidResource;

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