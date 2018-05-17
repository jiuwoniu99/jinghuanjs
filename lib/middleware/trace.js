'use strict';

module.exports = _safeRequire('../core/trace');

function _safeRequire(obj) {
  if (typeof obj === 'string') {
    try {
      obj = require(obj);
    } catch (e) {
      console.error(e);
      obj = null;
    }
  }

  return obj && obj.__esModule ? obj.default : obj;
}