const path = require('path');
const interopRequire = require('./util.js').interopRequire;
const debug = require('debug')(`JH:core/loader/events[${process.pid}]`);

/**
 * load validator
 */
module.exports = function load(appPath, modules) {
    modules.forEach(name => {
        let filepath = path.join(appPath, name, 'events.js');
        debug(`load file: ${filepath}`);
        interopRequire(filepath, true);
    });
    return {};
};
