'use strict';

var raw = require('raw-body');
var inflate = require('inflation');
var qs = require('querystring');

module.exports = function (ctx) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var req = ctx.req;

  // defaults
  var len = req.headers['content-length'];
  var encoding = req.headers['content-encoding'] || 'identity';
  if (len && encoding === 'identity') opts.length = ~~len;
  opts.encoding = opts.encoding || 'utf8';
  opts.limit = opts.limit || '1mb';

  return raw(inflate(req), opts).then(function (str) {
    return qs.parse(str);
  }).then(function (data) {
    return { post: data };
  });
};