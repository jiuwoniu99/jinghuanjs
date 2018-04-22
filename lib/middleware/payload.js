'use strict';

var parse = require('../core/payload/index.js');

module.exports = function () {
	var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	var extendTypes = Object.assign({
		json: [],
		form: [],
		text: [],
		multipart: [],
		xml: []
	}, opts.extendTypes);

	// default json types
	var jsonTypes = ['application/json'].concat(extendTypes.json);

	// default form types
	var formTypes = ['application/x-www-form-urlencoded'].concat(extendTypes.form);

	// default text types
	var textTypes = ['text/plain'].concat(extendTypes.text);

	// default multipart-form types
	var multipartTypes = ['multipart/form-data'].concat(extendTypes.multipart);

	// default xml types
	var xmlTypes = ['text/xml'].concat(extendTypes.xml);

	return function (ctx, next) {
		if (ctx.request.body !== undefined) return next();

		return parseBody(ctx, {
			opts: {
				limit: opts.limit,
				encoding: opts.encoding
			},
			multipartOpts: {
				keepExtensions: opts.keepExtensions,
				uploadDir: opts.uploadDir,
				encoding: opts.encoding,
				hash: opts.hash,
				multiples: opts.multiples
			}
		}).then(function (body) {
			ctx.request.body = body;
			return next();
		});
	};

	function parseBody(ctx, opts) {
		var methods = ['POST', 'PUT', 'DELETE', 'PATCH', 'LINK', 'UNLINK'];

		if (methods.every(function (method) {
			return ctx.method !== method;
		})) {
			return Promise.resolve({});
		}

		if (ctx.request.is(textTypes)) {
			return parse.text(ctx, opts.opts);
		}
		if (ctx.request.is(jsonTypes)) {
			return parse.json(ctx, opts.opts);
		}
		if (ctx.request.is(formTypes)) {
			return parse.form(ctx, opts.opts);
		}
		if (ctx.request.is(multipartTypes)) {
			return parse.multipart(ctx, opts.multipartOpts);
		}
		if (ctx.request.is(xmlTypes)) {
			return parse.xml(ctx, opts.opts);
		}

		return Promise.resolve({});
	}
};