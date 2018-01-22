/**
 *
 * @param options
 * @param app
 * @return {Function}
 */
module.exports = function (options, app) {
	/**
	 *
	 */
	return async function (ctx, next) {
		
		let pathname = ctx.path || '';
		pathname = pathname.trim().replace(/\/+/ig, '/');
		pathname = pathname.replace(/(^\/*)|(\/*$)/g, "");
		pathname = pathname.split('/');
		let module = pathname.shift();
		let action = pathname.pop();
		let controller = pathname.join("/");
		ctx.module = module || defaultOption.module;
		ctx.controller = controller || defaultOption.controller;
		ctx.action = action || defaultOption.action;
		
		await next();
	}
}