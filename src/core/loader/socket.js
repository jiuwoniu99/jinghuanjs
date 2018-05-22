import path from 'path';
import fs from 'fs-extra';
import pathToRegexp from 'path-to-regexp';
import helper from '../helper';
import define from '../helper/define';
import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';

const log = require('debug')(`JH:core/loader/socket[${process.pid}]`);

/**
 * 中间件加载器
 */
class Middleware {
    constructor() {
    }
    
    /**
     * check url matched
     */
    createRegexp(match) {
        if (isFunction(match)) {
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
        if (isFunction(rule)) {
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
            return require.resolve(name, {paths: jinghuan.paths});
        } catch (e) {
            return false;
        }
    }
    
    /**
     *
     * @param item
     */
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
            handle = require(socket);
            if (handle) {
                item.socket = handle(item.options, jinghuan.app);
            }
        }
    }
    
    /**
     *
     * @param sockets
     * @return {any[]}
     */
    parse(sockets = []) {
        
        return sockets.map(item => {
            if (isString(item)) {
                return {handle: item};
            }
            if (isFunction(item)) {
                return {handle: () => item};
            }
            return item;
        }).filter(item => {
            return !('enable' in item) || item.enable;
        }).map(item => {
            
            // 高级设置 设置忽略的请求
            const match = this.createRegexp(item.match);
            const ignore = this.createRegexp(item.ignore);
            
            if (jinghuan.mode === 'lib') {
                this.requireMid(item);
            }
            
            return (ctx, next) => {
                
                // src dev 模式下中间件是没有加载的
                if (isString(item.handle)) {
                    this.requireMid(item);
                } else {
                    if (!helper.isEmpty(item.socket)) {
                        item.socket = item.handle(item.options, jinghuan.app)
                    }
                }
                
                if ((match && !this.checkMatch(match, ctx)) || (ignore && this.checkMatch(ignore, ctx))) {
                    return next();
                }
                return item.socket(ctx, next);
            };
        });
    }
    
    /**
     * 加载解析中间件
     * @return {*}
     */
    load() {
        
        // 获取引用的中间件配置
        let sockets = jinghuan.config('socket');
        
        if (!sockets) {
            
            // 通用配置
            let filepath = path.join(jinghuan.ROOT_PATH, jinghuan.source, '/common/bootstrap/socket.js');
            
            if (!helper.isFile(filepath)) {
                return [];
            }
            log(`load file: ${filepath}`);
            
            sockets = require(filepath);
        }
        let ms = [];
        sockets.map((v, k) => {
            ms.push(v.handle);
        });
        define('sockets', ms);
        return this.parse(sockets);
    }
}

export default Middleware;
