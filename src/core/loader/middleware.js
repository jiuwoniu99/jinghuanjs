import path from 'path';
import assert from 'assert';
import pathToRegexp from 'path-to-regexp';
import helper from '../helper';
import debug from 'debug';
import define from '../helper/define';

const log = debug(`JH:core/loader/middleware[${process.pid}]`);

/**
 * 中间件加载器
 */
class Middleware {

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
     * @param name
     */
    checkMid(name) {
        try {
            return require.resolve(name, jinghuan.requireResolve);
        } catch (e) {
            return false;
        }
    }

    /**
     *
     * @param middlewares
     * @param app
     * @return {any[]}
     */
    parse(middlewares = [], app) {

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

            // if (helper.isString(item.handle)) {
            //     let p = '';
            //     if (p = this.checkMid('src/middleware/' + item.handle)) {
            //         item.handle = require(p);
            //     } else if (p = this.checkMid('src/common/middleware/' + item.handle)) {
            //         item.handle = require(p);
            //     } else if (p = this.checkMid('jinghuan-middleware-' + item.handle)) {
            //         item.handle = require(p);
            //     }
            // }
            //
            // assert(helper.isFunction(item.handle), 'handle must be a function');
            //
            // const options = item.options || {};
            // let handle = item.handle;
            // // 如果选项是一个方法，也许想选择异步
            // // 当应用程序就绪时，获取参数执行方法
            // if (helper.isFunction(options)) {
            //     let params = {};
            //     // 服务启动异步处理
            //     app.jinghuan.beforeStartServer(() => {
            //         return Promise.resolve(options()).then(data => {
            //             params = data;
            //         });
            //     });
            //     // 准备就绪
            //     app.on('appReady', () => {
            //         handle = handle(params, app);
            //     });
            //     // 重构handle
            //     item.handle = (ctx, next) => {
            //         return handle(ctx, next);
            //     };
            // } else {
            //     item.handle = handle(options, app);
            //     // handle also be a function
            //     assert(helper.isFunction(item.handle), 'handle must return a function');
            // }
            return item;
        }).map(item => {

            // 高级设置 设置忽略的请求
            const match = this.createRegexp(item.match);
            const ignore = this.createRegexp(item.ignore);

            // has match or ignore
            return (ctx, next) => {

                // if (!item.middleware && helper.isFunction(item.handle)) {
                //     item.middleware = handle(item.options, app);
                // } else if (!item.middleware && helper.isString(item.handle)) {
                let middleware;
                if (middleware = this.checkMid('src/middleware/' + item.handle)) {
                } else if (middleware = this.checkMid('src/common/middleware/' + item.handle)) {
                } else if (middleware = this.checkMid('jinghuan-middleware-' + item.handle)) {
                }

                let cahce = require.cache[middleware];
                let handle = null;
                if (!cahce) {
                    handle = require(middleware);
                    if (handle) {
                        item.middleware = handle(item.options, app);
                    }
                }
                // }

                if ((match && !this.checkMatch(match, ctx)) || (ignore && this.checkMatch(ignore, ctx))) {
                    return next();
                }
                return item.middleware(ctx, next);
            };
        });
    }

    /**
     * 该方法会加载框架与应用中所有的中间件
     * @param middlewarePath
     * @return {{}}
     */
    // getFiles(middlewarePath) {
    //     const ret = {};
    //     helper.getdirFiles(middlewarePath).forEach(file => {
    //         if (!/\.(?:js|es)$/.test(file)) {
    //             return;
    //         }
    //         const match = file.match(/(.+)\.\w+$/);
    //         if (match && match[1]) {
    //             const filepath = path.join(middlewarePath, file);
    //             log(`load file: ${filepath}`);
    //             ret[match[1]] = require(filepath);
    //         }
    //     });
    //     return ret;
    // }

    /**
     * 加载系统和应用程序的中间件列表
     * @return {*}
     */
    // loadFiles() {
    //
    //     const appMiddlewarePath = path.join(jinghuan.ROOT_PATH, jinghuan.source, '/common/middleware');
    //     const jhMiddlewarePath = path.join(__dirname, '../../middleware');
    //
    //     return helper.extend({},
    //         this.getFiles(jhMiddlewarePath),
    //         this.getFiles(appMiddlewarePath)
    //     );
    // }

    /**
     * 加载解析中间件
     * @param app
     * @return {*}
     */
    load(app) {

        // 获取引用的中间件配置
        let middlewares = jinghuan.config('middleware');

        if (!middlewares) {

            // 通用配置
            let filepath = path.join(jinghuan.ROOT_PATH, jinghuan.source, '/common/bootstrap/middleware.js');

            if (!helper.isFile(filepath)) {
                return [];
            }
            log(`load file: ${filepath}`);

            middlewares = require(filepath);
        }
        let ms = [];
        middlewares.map((v, k) => {
            ms.push(v.handle);
        });
        define('middlewares', ms);
        return this.parse(middlewares, app);

        // return this.parse(middlewares, this.loadFiles(), app);
    }
}

export default Middleware;
