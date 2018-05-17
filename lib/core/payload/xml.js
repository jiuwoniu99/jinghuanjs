'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _text = require('./text.js');

var _text2 = _interopRequireDefault(_text);

var _helper = require('../helper');

var _helper2 = _interopRequireDefault(_helper);

var _xml2js = require('xml2js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const parser = _helper2.default.promisify(_xml2js.parseString, _xml2js.parseString);

exports.default = (ctx, opts) => (0, _text2.default)(ctx, opts).then(parser).then(data => ({ post: data }));