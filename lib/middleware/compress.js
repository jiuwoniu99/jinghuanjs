'use strict';

var compress = require('koa-compress');

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
	return compress({
		threshold: 1,
		flush: require('zlib').Z_SYNC_FLUSH
	});
};