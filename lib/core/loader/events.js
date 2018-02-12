const path = require('path');
const interopRequire = require('./util.js').interopRequire;
const debug = require('debug')(`JH:core/loader/events[${process.pid}]`);
const helper = require('../helper');
const _ = require('lodash');

/**
 *
 * @param appPath
 * @param modules
 * @return {{}}
 */
module.exports = function load(appPath, modules) {
    _.each(modules, (val, name) => {
        let filepath = path.join(appPath, val, 'events.js');
        if (helper.isFile(filepath)) {
            debug(`load file: ${filepath}`);
            interopRequire(filepath, true);
        }
    });
    return {};
};
