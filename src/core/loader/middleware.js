const path = require('path');
//
const assert = require('assert');
const pathToRegexp = require('path-to-regexp');
const debug = require('debug')(`JH:core/loader/middleware[${process.pid}]`);
//const _ = require('lodash');
//
const helper = require('../helper');
const interopRequire = require('./util.js').interopRequire;

/**
 * 中间件加载器
 */
class Middleware {

    /**
     *
     * @param path
     * @return {*}
     */
    interopRequire(path) {
        return interopRequire(path);
    }

    /**
     * check url matched
     */
    createRegexp(match) {
        if (helper.isFunction(match)) {
            return match;
        }
        if (match) {
            return pathToRegexp(match);
        }
    }

    /**
     * check rule match
     */
    checkMatch(rule, ctx) {
        if (helper.isFunction(rule)) {
            return rule(ctx);
        }
        return rule.test(ctx.path);
    }

    /**
     *
     * @param middlewares
     * @param middlewarePkg
     * @param app
     * @return {any[]}
     */
    parse(middlewares = [], middlewarePkg = {}, app) {
        return middlewares.map(item => {
            if (helper.isString(item)) {
                return {handle: item};
            }
            if (helper.isFunction(item)) {
                return {handle: () => item};
            }
            return item;
        }).filter(item => {
            return !('enable' in item) || item.enable;
        }).map(item => {
            if (helper.isString(item.handle)) {
                item.handle = middlewarePkg[item.handle];
            }
            assert(helper.isFunction(item.handle), 'handle must be a function');
            const options = item.options || {};
            let handle = item.handle;
            // 如果选项是一个方法，也许想选择异步
            // 当应用程序就绪时，获取参数执行方法
            if (helper.isFunction(options)) {
                let params = {};
                // 服务启动异步处理
                app.jinghuan.beforeStartServer(() => {
                    return Promise.resolve(options()).then(data => {
                        params = data;
                    });
                });
                // 准备就绪
                app.on('appReady', () => {
                    handle = handle(params, app);
                });
                // 重构handle
                item.handle = (ctx, next) => {
                    return handle(ctx, next);
                };
            } else {
                item.handle = handle(options, app);
                // handle also be a function
                assert(helper.isFunction(item.handle), 'handle must return a function');
            }
            return item;
        }).map(item => {
            if (!item.match && !item.ignore) {
                return item.handle;
            }

            // 高级设置 设置忽略的请求
            const match = this.createRegexp(item.match);
            const ignore = this.createRegexp(item.ignore);

            // has match or ignore
            return (ctx, next) => {
                if ((match && !this.checkMatch(match, ctx)) ||
                    (ignore && this.checkMatch(ignore, ctx))) {
                    return next();
                }
                return item.handle(ctx, next);
            };
        });
    }

    /**
     * 该方法会加载框架与应用中所有的中间件
     * @param middlewarePath
     * @return {{}}
     */
    getFiles(middlewarePath) {
        const ret = {};
        helper.getdirFiles(middlewarePath).forEach(file => {
            if (!/\.(?:js|es)$/.test(file)) {
                return;
            }
            const match = file.match(/(.+)\.\w+$/);
            if (match && match[1]) {
                const filepath = path.join(middlewarePath, file);
                debug(`load file: ${filepath}`);
                ret[match[1]] = this.interopRequire(filepath);
            }
        });
        return ret;
    }

    /**
     * 加载系统和应用程序的中间件列表
     * @param appPath
     * @param jinghuanPath
     * @return {*|Object}
     */
    loadFiles(appPath, jinghuanPath) {
        const appMiddlewarePath = path.join(jinghuan.ROOT_PATH, 'common/middleware');
        return helper.extend({}, this.getFiles(path.join(jinghuanPath, 'middleware')), this.getFiles(appMiddlewarePath));
    }

    /**
     * 加载解析中间件
     * @param appPath
     * @param jinghuanPath
     * @param modules
     * @param app
     * @return {*}
     */
    load(appPath, jinghuanPath, modules, app) {
        let filepath = path.join(jinghuan.ROOT_PATH, 'common/bootstrap/middleware.js');
        if (!helper.isFile(filepath)) {
            return [];
        }
        debug(`load file: ${filepath}`);
        const middlewares = this.interopRequire(filepath);
        return this.parse(middlewares, this.loadFiles(appPath, jinghuanPath), app);
    }
}

module.exports = Middleware;
