'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (dir, ext = [], load = false) {
    if (isString(ext)) {
        ext = [ext];
    }
    const ragexp = new RegExp('\\.(' + ext.join('|') + ')$');
    const cache = {};

    helper.getdirFiles(dir).filter(file => {
        return ragexp.test(file);
    }).forEach(file => {
        const name = file.replace(/\\/g, '/').replace(ragexp, '');
        if (load) {
            cache[name] = _safeRequire(path.join(dir, file));
        } else {
            cache[name] = path.join(dir, file);
        }
    });
    return cache;
};

const helper = _safeRequire('./index');

const path = _safeRequire('path');

const isString = _safeRequire('lodash/isString');

;

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