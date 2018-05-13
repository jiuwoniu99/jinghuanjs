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

            // 高级设置 设置忽略的请求
            const match = this.createRegexp(item.match);
            const ignore = this.createRegexp(item.ignore);

            return (ctx, next) => {
                let middleware = this.checkMid(jinghuan.mode + '/middleware/' + item.handle) ||
                    this.checkMid(jinghuan.source + '/common/middleware/' + item.handle) ||
                    this.checkMid('jinghuan-middleware-' + item.handle);

                let cache = require.cache[middleware];
                let handle = null;
                if (!cache) {
                    handle = require(middleware);
                    if (handle) {
                        item.middleware = handle(item.options, app);
                    }
                }

                if ((match && !this.checkMatch(match, ctx)) || (ignore && this.checkMatch(ignore, ctx))) {
                    return next();
                }
                return item.middleware(ctx, next);
            };
        });
    }

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
    }
}

export default Middleware;
