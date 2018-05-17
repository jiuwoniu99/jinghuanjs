"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require("./lib/util");

var _util2 = _interopRequireDefault(_util);

var _messenger = require("./lib/messenger.js");

var _messenger2 = _interopRequireDefault(_messenger);

var _worker = require("./lib/worker.js");

var _worker2 = _interopRequireDefault(_worker);

var _master = require("./lib/master.js");

var _master2 = _interopRequireDefault(_master);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let messenger = new _messenger2.default();

exports.default = {
    Worker: _worker2.default, Master: _master2.default, messenger
};