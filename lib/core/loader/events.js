const path = require('path');
const interopRequire = require('./util.js').interopRequire;
const debug = require('debug')(`loader-events-${process.pid}`);

/**
 * load validator
 */
module.exports = function load(appPath, modules) {
	modules.forEach(name => {
		let filepath = path.join(appPath, name, 'events.js');
		interopRequire(filepath, true);
	})
	return {};
};
