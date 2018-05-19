"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _date = require("locutus/php/datetime/date");

var _date2 = _interopRequireDefault(_date);

var _isString = require("lodash/isString");

var _isString2 = _interopRequireDefault(_isString);

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = jinghuan && jinghuan.logger || console;
const trigger = 'jinghuanjs';

let Slog = class Slog {
    constructor(ctx) {
        this.ctx = ctx;
        this.client_id = null;
        this.tabid = null;
        this.logInfo = [];

        let socketlog = null;

        if (ctx.req) {
            socketlog = ctx.req.headers.socketlog;
        }

        if ((0, _isString2.default)(socketlog)) {
            let match = socketlog.match(/SocketLog\((.*?)\)/);
            let data = {};
            php.strings.parse_str(match[1], data);
            this.client_id = data['client_id'];
            this.tabid = data['tabid'];
        }
        logger.info('');
    }

    info(msg) {
        this.logInfo.push({ msg, type: 'log', trigger });
        logger.info(msg);
    }

    debug(msg) {
        this.logInfo.push({ msg, type: 'debug', trigger });
        logger.debug(msg);
    }

    table() {
        this.logInfo.push({ msg, type: 'table', trigger });
        logger.info(msg);
    }

    error(msg) {
        this.logInfo.push({ msg, type: 'error', trigger });
        logger.error(msg);
    }

    warn(msg) {
        this.logInfo.push({ msg, type: 'warn', trigger });
        logger.warn(warn);
    }

    sql(msg) {
        this.logInfo.push({ msg, type: 'info', trigger });
        logger.info(msg);
    }

    send(time) {
        if (this._stop) return;

        let config = jinghuan.config('slog') || {};

        let { ctx } = this;
        let info = `[REQUEST] ${(0, _date2.default)('Y-m-d H:i:s')} ${ctx.method} ${ctx.host}${ctx.url} ${ctx.status} ${time}ms`;

        logger.info(info);

        this.logInfo.unshift({
            msg: info,
            type: 'groupCollapsed',
            css: 'color:#40e2ff;background:#171717;'
        });

        this.logInfo.push({ msg: '', type: 'groupEnd' });

        let content = JSON.stringify({
            'tabid': this.tabid,
            'client_id': this.client_id,
            'logs': this.logInfo,
            'force_client_id': config.force_client_id,
            'url': `${ctx.host}${ctx.url} ${ctx.status} ${time}ms`,
            'file': config.serverLog ? `${jinghuan.env}/${(0, _date2.default)('Y-m-d')}.log` : false,
            'ip': this.ctx.ip
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

        let req = _http2.default.request(options);
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
;
exports.default = Slog;