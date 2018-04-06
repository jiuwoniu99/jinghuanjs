'use strict';

var path = require('path');
var interopRequire = require('./util.js').interopRequire;
var debug = require('debug')('JH:core/loader/validator[' + process.pid + ']');

/**
 * load validator
 */
module.exports = function load(appPath, modules) {
  var filepath = '';
  if (modules.length) {
    filepath = path.join(appPath, 'common/config/validator.js');
  } else {
    filepath = path.join(appPath, 'config/validator.js');
  }
  debug('load file: ' + filepath);
  var data = interopRequire(filepath, true) || {};
  return data;
};