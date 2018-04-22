'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
//
var assert = require('assert');
var pathToRegexp = require('path-to-regexp');
var debug = require('debug')('JH:core/loader/middleware[' + process.pid + ']');
//const _ = require('lodash');
//
var helper = require('../helper');
var _interopRequire = require('./util.js').interopRequire;

/**
 * 中间件加载器
 */

var Middleware = function () {
    function Middleware() {
        _classCallCheck(this, Middleware);
    }

    /**
     *
     * @param path
     * @return {*}
     */
    Middleware.prototype.interopRequire = function interopRequire(path) {
        return _interopRequire(path);
    };

    /**
     * check url matched
     */


    Middleware.prototype.createRegexp = function createRegexp(match) {
        if (helper.isFunction(match)) {
            return match;
        }
        if (match) {
            return pathToRegexp(match);
        }
    };

    /**
     * check rule match
     */


    Middleware.prototype.checkMatch = function checkMatch(rule, ctx) {
        if (helper.isFunction(rule)) {
            return rule(ctx);
        }
        return rule.test(ctx.path);
    };

    /**
     *
     * @param middlewares
     * @param middlewarePkg
     * @param app
     * @return {any[]}
     */


    Middleware.prototype.parse = function parse() {
        var middlewares = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        var _this = this;

        var middlewarePkg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var app = arguments[2];

        return middlewares.map(function (item) {
            if (helper.isString(item)) {
                return { handle: item };
            }
            if (helper.isFunction(item)) {
                return { handle: function handle() {
                        return item;
                    } };
            }
            return item;
        }).filter(function (item) {
            return !('enable' in item) || item.enable;
        }).map(function (item) {
            if (helper.isString(item.handle)) {
                item.handle = middlewarePkg[item.handle];
            }
            assert(helper.isFunction(item.handle), 'handle must be a function');
            var options = item.options || {};
            var handle = item.handle;
            // 如果选项是一个方法，也许想选择异步
            // 当应用程序就绪时，获取参数执行方法
            if (helper.isFunction(options)) {
                var params = {};
                // 服务启动异步处理
                app.jinghuan.beforeStartServer(function () {
                    return Promise.resolve(options()).then(function (data) {
                        params = data;
                    });
                });
                // 准备就绪
                app.on('appReady', function () {
                    handle = handle(params, app);
                });
                // 重构handle
                item.handle = function (ctx, next) {
                    return handle(ctx, next);
                };
            } else {
                item.handle = handle(options, app);
                // handle also be a function
                assert(helper.isFunction(item.handle), 'handle must return a function');
            }
            return item;
        }).map(function (item) {
            if (!item.match && !item.ignore) {
                return item.handle;
            }

            // 高级设置 设置忽略的请求
            var match = _this.createRegexp(item.match);
            var ignore = _this.createRegexp(item.ignore);

            // has match or ignore
            return function (ctx, next) {
                if (match && !_this.checkMatch(match, ctx) || ignore && _this.checkMatch(ignore, ctx)) {
                    return next();
                }
                return item.handle(ctx, next);
            };
        });
    };

    /**
     * 该方法会加载框架与应用中所有的中间件
     * @param middlewarePath
     * @return {{}}
     */


    Middleware.prototype.getFiles = function getFiles(middlewarePath) {
        var _this2 = this;

        var ret = {};
        helper.getdirFiles(middlewarePath).forEach(function (file) {
            if (!/\.(?:js|es)$/.test(file)) {
                return;
            }
            var match = file.match(/(.+)\.\w+$/);
            if (match && match[1]) {
                var filepath = path.join(middlewarePath, file);
                debug('load file: ' + filepath);
                ret[match[1]] = _this2.interopRequire(filepath);
            }
        });
        return ret;
    };

    /**
     * 加载系统和应用程序的中间件列表
     * @param appPath
     * @param jinghuanPath
     * @return {*|Object}
     */


    Middleware.prototype.loadFiles = function loadFiles(appPath, jinghuanPath) {
        var appMiddlewarePath = path.join(jinghuan.ROOT_PATH, 'common/middleware');
        return helper.extend({}, this.getFiles(path.join(jinghuanPath, 'middleware')), this.getFiles(appMiddlewarePath));
    };

    /**
     * 加载解析中间件
     * @param appPath
     * @param jinghuanPath
     * @param modules
     * @param app
     * @return {*}
     */


    Middleware.prototype.load = function load(appPath, jinghuanPath, modules, app) {
        var filepath = path.join(jinghuan.ROOT_PATH, 'common/bootstrap/middleware.js');
        if (!helper.isFile(filepath)) {
            return [];
        }
        debug('load file: ' + filepath);
        var middlewares = this.interopRequire(filepath);
        return this.parse(middlewares, this.loadFiles(appPath, jinghuanPath), app);
    };

    return Middleware;
}();

module.exports = Middleware;