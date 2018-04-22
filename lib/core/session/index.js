'use strict';

var Session = require('./lib/session.js');

/**
 *
 * @param name
 * @param value
 * @param options
 * @return {*}
 */
module.exports = function (name, value, options) {
  var instance = new Session(this, options);
  return instance.run(name, value);
};