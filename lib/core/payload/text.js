'use strict';

const raw = _safeRequire('raw-body');
const inflate = _safeRequire('inflation');

module.exports = function (ctx, opts = {}) {
  const req = ctx.req;

  const len = req.headers['content-length'];
  const encoding = req.headers['content-encoding'] || 'identity';
  if (len && encoding === 'identity') opts.length = ~~len;
  opts.encoding = opts.encoding || 'utf8';
  opts.limit = opts.limit || '1mb';

  return raw(inflate(req), opts);
};

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