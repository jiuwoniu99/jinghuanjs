'use strict';

var _action = require('./action');

var _action2 = _interopRequireDefault(_action);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _rest = require('./rest');

var _rest2 = _interopRequireDefault(_rest);

var _rpc = require('./rpc');

var _rpc2 = _interopRequireDefault(_rpc);

var _define = require('../core/helper/define');

var _define2 = _interopRequireDefault(_define);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _define2.default)('props', { action: _action2.default, api: _api2.default, rest: _rest2.default, rpc: _rpc2.default });