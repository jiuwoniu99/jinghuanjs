'use strict';

var path = require('path');
var interopRequire = require('./util.js').interopRequire;
var helper = require('../helper');
var debug = require('debug')('JH:core/loader/crontab[' + process.pid + ']');

/**
 * load crontab
 */
module.exports = function loader(appPath, modules) {
    var crontab = [];
    modules.forEach(function (m) {
        var filepath = path.join(appPath, m + '/config/crontab.js');
        if (helper.isFile(filepath)) {
            debug('load file: ' + filepath);
            var data = interopRequire(filepath, true) || [];
            crontab = crontab.concat(data);
        }
    });
    return crontab;
};