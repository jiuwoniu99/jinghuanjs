'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let bridge = {};

bridge.preg_split = function (expr, str) {
    try {
        let s = str.split(eval(expr));
        let r = [];
        for (var v of s) {
            if (v) {
                r.push(v);
            }
        }
        return r;
    } catch (ex) {}
};

exports.default = bridge;