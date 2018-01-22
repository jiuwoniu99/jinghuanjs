const fs = require('fs');
const helper = require('think-helper');


/**
 * 程序在初始化时开始执行
 * @param options
 * @param app
 * @return {function(*=, *)}
 */
module.exports = (options, app) => {
	for (let name of ['database', 'slog']) {
		let file1 = app.jinghuan.ROOT_PATH + '/config/' + name + '.js';
		if (fs.existsSync(file1)) {
			let oldConfig = app.jinghuan.config(name) || {};
			let newConfig = require(file1) || {}
			app.jinghuan.config(name, helper.extend({}, oldConfig, newConfig))
		}
		
		let file2 = app.jinghuan.ROOT_PATH + '/config/' + app.jinghuan.env + '/' + name + '.js';
		if (fs.existsSync(file2)) {
			let oldConfig = app.jinghuan.config(name) || {};
			let newConfig = require(file2) || {}
			app.jinghuan.config(name, helper.extend({}, oldConfig, newConfig))
		}
	}
	
	/**
	 *
	 */
	return async (ctx, next) => {
		let st = new Date().getTime();
		try {
			await next();
			let et = new Date().getTime();
			ctx.slog.send(et - st);
		} catch (ex) {
			let et = new Date().getTime();
			ctx.status = 500;
			ctx.slog.error(ex);
			ctx.slog.send(et - st);
		}
	}
}
