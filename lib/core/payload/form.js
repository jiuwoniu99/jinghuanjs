'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (ctx, opts = {}) {
    const req = ctx.req;

    const len = req.headers['content-length'];
    const encoding = req.headers['content-encoding'] || 'identity';
    if (len && encoding === 'identity') opts.length = ~~len;
    opts.encoding = opts.encoding || 'utf8';
    opts.limit = opts.limit || '1mb';

    return (0, _rawBody2.default)((0, _inflation2.default)(req), opts).then(str => _querystring2.default.parse(str)).then(data => ({ post: data }));
};

var _rawBody = require('raw-body');

var _rawBody2 = _interopRequireDefault(_rawBody);

var _inflation = require('inflation');

var _inflation2 = _interopRequireDefault(_inflation);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;