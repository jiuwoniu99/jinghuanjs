'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log4js = require('log4js');
var _logger = Symbol('_logger');

module.exports = function () {
  function _class(config) {
    _classCallCheck(this, _class);

    this[_logger] = {};
    var logConfig = this.formatConfig(config);
    this.setLogger(logConfig);
  }

  _class.prototype.debug = function debug() {
    var _logger2;

    return (_logger2 = this[_logger]).debug.apply(_logger2, arguments);
  };

  _class.prototype.info = function info() {
    var _logger3;

    return (_logger3 = this[_logger]).info.apply(_logger3, arguments);
  };

  _class.prototype.warn = function warn() {
    var _logger4;

    return (_logger4 = this[_logger]).warn.apply(_logger4, arguments);
  };

  _class.prototype.error = function error() {
    var _logger5;

    return (_logger5 = this[_logger]).error.apply(_logger5, arguments);
  };

  /**
   * log4js configure
   */


  _class.prototype.configure = function configure(config) {
    return log4js.configure(config);
  };

  /**
   * log4js setLogger
   */


  _class.prototype.setLogger = function setLogger(config, category) {
    this.configure(config);
    this[_logger] = log4js.getLogger(category);
  };

  _class.prototype.formatConfig = function formatConfig(config) {
    return config;
  };

  return _class;
}();