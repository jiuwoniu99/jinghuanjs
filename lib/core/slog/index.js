const php = require('locutus/php');
const http = require('http');


const style = {
	error: 'font-size:12px;color:#d9534f;',
	info: 'font-size:12px;color:#00a65a;',
	debug: 'font-size:12px;color:#337ab7;',
	warn: 'font-size:12px;color:#f0ad4e;'
}

logger = (jinghuan && jinghuan.logger) || console;

/**
 * Slog 远程日志类
 */
module.exports = class Slog {
	
	/**
	 *
	 * @param config
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
		
		if (php.var.is_string(socketlog)) {
			let match = socketlog.match(/SocketLog\((.*?)\)/);
			let data = {};
			php.strings.parse_str(match[1], data);
			this.client_id = data['client_id'];
			this.tabid = data['tabid']
		}
		logger.info("");
	}
	
	
	/**
	 * info
	 * @param msg
	 */
	info(msg) {
		let info = '[INFO] ' + msg;
		this.logInfo.push({msg: info, type: 'log', css: style.info});
		logger.info(info);
	}
	
	/**
	 * debug
	 * @param msg
	 */
	debug(msg) {
		if (php.var.is_string(msg)) {
			this.logInfo.push({msg: '[DEBUG] ' + msg, type: 'log', css: style.debug});
			logger.debug(msg);
		} else {
			this.logInfo.push({msg: msg, type: 'dir'});
			logger.debug(msg);
		}
	}
	
	/**
	 * error
	 * @param ex
	 */
	error(ex) {
		this.logInfo.push({msg: '[ERROR] ' + ex.message + ex.stack, type: 'log', css: style.error});
		logger.error(ex);
	}
	
	/**
	 * warn
	 * @param msg
	 */
	warn(msg) {
		let warn = '[WARN] ' + msg
		this.logInfo.push({msg: warn, type: 'log', css: style.warn});
		logger.warn(warn);
	}
	
	/**
	 * sql
	 * @param msg
	 */
	sql(msg) {
		let sql = '[SQL] ' + msg;
		this.logInfo.push({msg: sql, type: 'log', css: style.info});
		logger.info(sql);
	}
	
	
	/**
	 * 发送日志给服务端
	 */
	send(time) {
		let config = jinghuan.config('slog') || {};
		
		let {ctx} = this;
		let info = `[REQUEST] ${php.datetime.date('Y-m-d H:i:s')} ${ctx.method} ${ctx.host}${ctx.url} ${ctx.status} ${time}ms`;
		
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
			'file': config.serverLog ? `${jinghuan.env}/${php.datetime.date('Y-m-d')}.log` : false,
			'ip': this.ctx.ip,
		});
		
		
		let options = {
			hostname: config.host || 'www.jinghuan.info',
			port: config.port || 1116,
			path: '/' + config.force_client_id,
			method: 'POST',
			headers: {
				"Content-Type": 'application/x-www-form-urlencoded'
			}
		};
		
		let req = http.request(options);
		req.write(content);
		req.end();
		req.on('error', function (e) {
			console.error("error:" + e);
		});
	}
	
	
}

//module.exports = function (ctx, options, app) {
//	// 加载 Slog
//	ctx.slog = new Slog(options, ctx);
//}