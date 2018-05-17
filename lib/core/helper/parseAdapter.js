'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (config = {}, options = {}) {
    options.type = options.type || config.type;
    let adapter = config[config.type];
    return (0, _merge2.default)({}, adapter, options);
};

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }