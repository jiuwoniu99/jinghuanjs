'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (config = {}, options = {}) {
    options.type = options.type || config.type;
    let adapter = config[config.type];
    return merge({}, adapter, options);
};

const merge = _safeRequire('lodash/merge');

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