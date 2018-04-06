'use strict';

var helper = require('../helper');
var path = require('path');
var debug = require('debug')('JH:core/loader/bootstrap[' + process.pid + ']');

/**
 * load bootstrap files
 */
function loadBootstrap(appPath, modules) {
    var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'worker';

    var bootstrapPath = path.join(jinghuan.ROOT_PATH, 'common/bootstrap');
    var filepath = path.join(bootstrapPath, type + '.js');
    if (helper.isFile(filepath)) {
        debug('load file: ' + filepath);
        return require(filepath);
    }
}

module.exports = loadBootstrap;