'use strict';

exports.json = _safeRequire('./json.js');
exports.form = _safeRequire('./form.js');
exports.text = _safeRequire('./text.js');
exports.multipart = _safeRequire('./multipart.js');
exports.xml = _safeRequire('./xml.js');

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