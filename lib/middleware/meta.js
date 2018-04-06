'use strict';

var helper = require('../core/helper');
/**
 * default options
 */
var defaultOptions = {
	requestTimeout: 10 * 1000, // request timeout, default is 10s
	requestTimeoutCallback: function requestTimeoutCallback() {}, // request timeout callback
	sendPowerBy: true, // send powerby
	sendResponseTime: true, // send response time
	logRequest: true
};

/**
 * send meta middleware
 */
module.exports = function (options, app) {
	options = Object.assign({}, defaultOptions, options);
	options.requestTimeout = helper.ms(options.requestTimeout);

	return function (ctx, next) {
		// set request timeout
		ctx.res.setTimeout(options.requestTimeout, options.requestTimeoutCallback);
		// send power by header
		if (options.sendPowerBy && !ctx.res.headersSent) {
			var version = app.jinghuan.version;
			ctx.res.setHeader('X-Powered-By', 'jinghuan-' + version);
		}
		// send response time header
		if (options.sendResponseTime || options.logRequest) {
			var startTime = Date.now();
			var err = void 0;
			return next().catch(function (e) {
				err = e;
			}).then(function () {
				var endTime = Date.now();
				if (options.sendResponseTime && !ctx.res.headersSent) {
					ctx.res.setHeader('X-Response-Time', endTime - startTime + 'ms');
				}
				if (options.logRequest) {
					process.nextTick(function () {
						app.jinghuan.logger.info(ctx.method + ' ' + ctx.url + ' ' + ctx.status + ' ' + (endTime - startTime) + 'ms');
					});
				}
				if (err) return Promise.reject(err);
			});
		} else {
			return next();
		}
	};
};