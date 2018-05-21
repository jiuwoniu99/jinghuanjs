'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

const debug = _safeRequire('debug');

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