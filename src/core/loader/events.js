const path = require('path');
const interopRequire = require('./util.js').interopRequire;
const debug = require('debug')(`JH:core/loader/events[${process.pid}]`);
const helper = require('../helper');
//const _ = require('lodash');
const each = require('lodash/each');

/**
 *
 * @return {{}}
 */
module.exports = function load() {
    let {modules, APP_PATH} = jinghuan;

    each(modules, (val, name) => {
        let filepath = path.join(APP_PATH, val, 'events.js');
        if (helper.isFile(filepath)) {
            debug(`load file: ${filepath}`);
            interopRequire(filepath, true);
        }
    });
    return {};
};
