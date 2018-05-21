'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

const compress = _safeRequire('koa-compress');

function invokeCompress(options, app) {
  return compress({
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

  return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}