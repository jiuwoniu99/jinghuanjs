'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var php = require('locutus/php');
var isString = require('lodash/isString');
var isArray = require('lodash/isArray');
var isObject = require('lodash/isObject');

var http = require('http');

var style = {
    error: 'font-size:12px;color:#d9534f;',
    info: 'font-size:12px;color:#00a65a;',
    debug: 'font-size:12px;color:#337ab7;',
    warn: 'font-size:12px;color:#f0ad4e;'
};

var logger = jinghuan && jinghuan.logger || console;
var trigger = 'jinghuanjs';
/**
 * Slog 远程日志类
 */
module.exports = function () {

    /**
     *
     * @param config
     * @param ctx
     */
    function Slog(ctx) {
        _classCallCheck(this, Slog);

        this.ctx = ctx;
        this.client_id = null;
        this.tabid = null;
        this.logInfo = [];

        //
        var socketlog = null;

        if (ctx.req) {
            socketlog = ctx.req.headers.socketlog;
        }

        if (isString(socketlog)) {
            var match = socketlog.match(/SocketLog\((.*?)\)/);
            var data = {};
            php.strings.parse_str(match[1], data);
            this.client_id = data['client_id'];
            this.tabid = data['tabid'];
        }
        logger.info('');
    }

    /**
     * info
     * @param msg
     */


    Slog.prototype.info = function info(msg) {
        this.logInfo.push({ msg: msg, type: 'log', trigger: trigger });
        logger.info(msg);
    };

    /**
     * debug
     * @param msg
     */


    Slog.prototype.debug = function debug(msg) {
        this.logInfo.push({ msg: msg, type: 'debug', trigger: trigger });
        logger.debug(msg);
    };

    /**
     *
     */


    Slog.prototype.table = function table() {
        this.logInfo.push({ msg: msg, type: 'table', trigger: trigger });
        logger.info(msg);
    };

    /**
     * error
     * @param msg
     */


    Slog.prototype.error = function error(msg) {
        this.logInfo.push({ msg: msg, type: 'error', trigger: trigger });
        logger.error(msg);
    };

    /**
     * warn
     * @param msg
     */


    Slog.prototype.warn = function (_warn) {
        function warn(_x) {
            return _warn.apply(this, arguments);
        }

        warn.toString = function () {
            return _warn.toString();
        };

        return warn;
    }(function (msg) {
        this.logInfo.push({ msg: msg, type: 'warn', trigger: trigger });
        logger.warn(warn);
    });

    /**
     * sql
     * @param msg
     */


    Slog.prototype.sql = function sql(msg) {
        this.logInfo.push({ msg: msg, type: 'info', trigger: trigger });
        logger.info(msg);
    };

    /**
     * 发送日志给服务端
     */


    Slog.prototype.send = function send(time) {
        var config = jinghuan.config('slog') || {};

        var ctx = this.ctx;

        var info = '[REQUEST] ' + php.datetime.date('Y-m-d H:i:s') + ' ' + ctx.method + ' ' + ctx.host + ctx.url + ' ' + ctx.status + ' ' + time + 'ms';

        logger.info(info);

        this.logInfo.unshift({
            msg: info,
            type: 'groupCollapsed',
            css: 'color:#40e2ff;background:#171717;'
        });

        this.logInfo.push({ msg: '', type: 'groupEnd' });

        var content = JSON.stringify({
            'tabid': this.tabid,
            'client_id': this.client_id,
            'logs': this.logInfo,
            'force_client_id': config.force_client_id,
            'url': '' + ctx.host + ctx.url + ' ' + ctx.status + ' ' + time + 'ms',
            'file': config.serverLog ? jinghuan.env + '/' + php.datetime.date('Y-m-d') + '.log' : false,
            'ip': this.ctx.ip
        });

        var options = {
            hostname: config.host || 'www.jinghuan.info',
            port: config.port || 1116,
            path: '/' + config.force_client_id,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        var req = http.request(options);
        req.write(content);
        req.end();
        req.on('error', function (e) {
            console.error('error:' + e);
        });
    };

    return Slog;
}();

//module.exports = function (ctx, options, app) {
//	// 加载 Slog
//	ctx.slog = new Slog(options, ctx);
//}