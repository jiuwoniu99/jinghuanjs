'use strict';

var path = require('path');
var interopRequire = require('./util.js').interopRequire;
var debug = require('debug')('JH:core/loader/events[' + process.pid + ']');
var helper = require('../helper');
//const _ = require('lodash');
var each = require('lodash/each');

/**
 *
 * @return {{}}
 */
module.exports = function load() {
    var _jinghuan = jinghuan,
        modules = _jinghuan.modules,
        APP_PATH = _jinghuan.APP_PATH;


    each(modules, function (val, name) {
        var filepath = path.join(APP_PATH, val, 'events.js');
        if (helper.isFile(filepath)) {
            debug('load file: ' + filepath);
            interopRequire(filepath, true);
        }
    });
    return {};
};