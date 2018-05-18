'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _koaCompress = require('koa-compress');

var _koaCompress2 = _interopRequireDefault(_koaCompress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function invokeCompress(options, app) {
  return (0, _koaCompress2.default)({
    threshold: 1,
    flush: _safeRequire('zlib').Z_SYNC_FLUSH
  });
}

exports.default = invokeCompress;

function _safeRequire(obj) {
  if (typeof obj === 'string') {
    try {
      obj = require(obj);
    } catch (e) {
      console.error(e);
      obj = null;
    }
  }

  return obj && obj.__esModule ? obj.default || obj : obj;
}