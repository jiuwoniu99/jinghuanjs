'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (dir, ext = [], load = false) {
    if (_index2.default.isString(ext)) {
        ext = [ext];
    }
    const ragexp = new RegExp('\\.(' + ext.join('|') + ')$');
    const cache = {};

    _index2.default.getdirFiles(dir).filter(file => {
        return ragexp.test(file);
    }).forEach(file => {
        const name = file.replace(/\\/g, '/').replace(ragexp, '');
        if (load) {
            cache[name] = _safeRequire(_path2.default.join(dir, file));
        } else {
            cache[name] = _path2.default.join(dir, file);
        }
    });
    return cache;
};

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

    return obj && obj.__esModule ? obj.default : obj;
}