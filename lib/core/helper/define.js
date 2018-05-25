"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (name, val, target = jinghuan) {
    Object.defineProperty(target, name, {
        configurable: false,
        enumerable: true,
        writable: false,
        value: val
    });
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

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}