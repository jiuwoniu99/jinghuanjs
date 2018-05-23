import date from "locutus/php/datetime/date"
import isString from "lodash/isString"
//import isArray from "lodash/isArray"
//import isObject from "lodash/isObject"
import http from "http"
import parse_str from 'locutus/php/strings/parse_str'


const logger = (jinghuan && jinghuan.logger) || console;
const trigger = 'jinghuanjs';

/**
 * Slog 远程日志类
 */
class Slog {
    
    /**
     *
     * @param ctx
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.client_id = null;
        this.tabid = null;
        this.logInfo = [];
        
        //
        let socketlog = null;
        
        if (ctx.req) {
            socketlog = ctx.req.headers.socketlog;
        }
        
        if (isString(socketlog)) {
            let match = socketlog.match(/SocketLog\((.*?)\)/);
            let data = {};
            parse_str(match[1], data);
            this.client_id = data['client_id'];
            this.tabid = data['tabid'];
        }
        logger.info('');
    }
    
    /**
     * info
     * @param msg
     */
    info(msg) {
        this.logInfo.push({msg, type: 'log', trigger,});
        logger.info(msg);
    }
    
    /**
     * debug
     * @param msg
     */
    debug(msg) {
        this.logInfo.push({msg, type: 'debug', trigger});
        logger.debug(msg);
    }
    
    /**
     *
     */
    table() {
        this.logInfo.push({msg, type: 'table', trigger});
        logger.info(msg);
    }
    
    /**
     * error
     * @param msg
     */
    error(msg) {
        this.logInfo.push({msg, type: 'error', trigger});
        logger.error(msg);
    }
    
    /**
     * warn
     * @param msg
     */
    warn(msg) {
        this.logInfo.push({msg, type: 'warn', trigger});
        logger.warn(warn);
    }
    
    /**
     * sql
     * @param msg
     */
    sql(msg) {
        this.logInfo.push({msg, type: 'info', trigger});
        logger.info(msg);
    }
    
    /**
     * 发送日志给服务端
     */
    send(time) {
        if (this._stop)
            return;
        
        let config = jinghuan.config('slog') || {};
        
        let {ctx} = this;
        let tag = ctx.isSocket ? 'SOCKET' : 'REQUEST'
        let info = `[${tag}] ${ctx.request.ip} ${ctx.method} ${ctx.host}${ctx.url} ${ctx.status} ${time}ms`;
        
        logger.info(info);
        
        this.logInfo.unshift({
            msg: info,
            type: 'groupCollapsed',
            css: 'color:#40e2ff;background:#171717;'
        });
        
        this.logInfo.push({msg: '', type: 'groupEnd'});
        
        let content = JSON.stringify({
            'tabid': this.tabid,
            'client_id': this.client_id,
            'logs': this.logInfo,
            'force_client_id': config.force_client_id,
            'url': `${ctx.host}${ctx.url} ${ctx.status} ${time}ms`,
            'file': config.serverLog ? `${jinghuan.env}/${date('Y-m-d')}.log` : false,
            'ip': this.ctx.ip,
        });
        
        let options = {
            hostname: config.host || 'www.jinghuan.info',
            port: config.port || 1116,
            path: '/' + config.force_client_id,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        
        let req = http.request(options);
        req.write(content);
        req.end();
        req.on('error', function (e) {
            console.error('error:' + e);
        });
    }
    
    stop() {
        this._stop = true;
    }
};
export default Slog;
