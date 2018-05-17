'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _helper = require('../core/helper');

var _helper2 = _interopRequireDefault(_helper);

var _koaSend = require('koa-send');

var _koaSend2 = _interopRequireDefault(_koaSend);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)(`JH:middleware/resource[${process.pid}]`);

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
    if ((0, _isString2.default)(path) && !path.startsWith('/')) {
        path = '/' + path;
    }
    return path;
};

const matchRoute = (path, route) => {
    if (_helper2.default.isRegExp(route)) {
        return path.match(route);
    }
    if ((0, _isString2.default)(route)) {
        route = route.split('/');
        path = path.split(/\/+/);
        return route.every((item, index) => {
            if (!item || item === path[index]) {
                return true;
            }
        });
    }
};

function invokeResource(options) {
    options = _helper2.default.extend({}, defaultOptions, options || {});

    const root = options.root;
    (0, _assert2.default)(root, 'root directory is required to serve files');
    log('static "%s" %j', root, options);
    options.root = _path2.default.resolve(root);

    let publicPath = options.publicPath;
    (0, _assert2.default)(_helper2.default.isRegExp(publicPath) || (0, _isString2.default)(publicPath), 'publicPath must be regexp or string');
    options.publicPath = prefixPath(publicPath);

    const notFoundNext = options.notFoundNext;

    return function serve(ctx, next) {
        if (matchRoute(ctx.path, options.publicPath) && (ctx.method === 'HEAD' || ctx.method === 'GET')) {
            return (0, _koaSend2.default)(ctx, prefixPath(ctx.path), options).then(done => {
                if (!done && notFoundNext) {
                    return next();
                }
            });
        }
        return next();
    };
};

exports.default = invokeResource;