const defaultOption = {
	module: 'home',
	controller: 'index',
	action: 'index'
}

module.exports = function (options, app) {
	/**
	 *
	 */
	return async (ctx, next) => {
		let {origin} = ctx.header;
		
		if (origin) {
			ctx.set({
				'Access-Control-Allow-Origin': origin,
				'Access-Control-Allow-Credentials': 'true'
			});
			await next();
		} else {
			await next();
		}
	}
}