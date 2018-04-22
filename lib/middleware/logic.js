'use strict';

//const _ = require('lodash');
/**
 * invoke logic
 */
function invokeLogic(options, app) {
	return function (ctx, next) {
		var isMultiModule = app.modules.length;
		var logics = app.logics;

		if (isMultiModule && !ctx.module || !ctx.controller || !ctx.action) {
			return ctx.throw(404);
		}

		// avoid to throw error
		if (logics && isMultiModule) {
			logics = logics[ctx.module];
		}
		// logics empty
		if (helper.isEmpty(logics)) {
			return next();
		}
		var Logic = logics[ctx.controller];
		// logic not exist
		if (helper.isEmpty(Logic)) {
			return next();
		}
		var instance = new Logic(ctx);
		var promise = Promise.resolve();
		if (instance.__before) {
			promise = Promise.resolve(instance.__before());
		}
		// if return false, it will be prevent next process
		return promise.then(function (data) {
			if (data === false) return false;
			var method = ctx.action + 'Action';
			if (!instance[method]) {
				method = '__call';
			}
			if (instance[method]) {
				return instance[method]();
			}
		}).then(function (data) {
			if (data === false) return false;
			if (instance.__after) {
				return instance.__after();
			}
		}).then(function (data) {
			if (data !== false) {
				return next();
			}
		});
	};
}

module.exports = invokeLogic;