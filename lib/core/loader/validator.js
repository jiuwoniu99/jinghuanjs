'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)(`JH:core/loader/validator[${process.pid}]`);

module.exports = function load(appPath, modules) {
    let filepath = '';
    if (modules.length) {
        filepath = _path2.default.join(appPath, 'common/config/validator.js');
    } else {
        filepath = _path2.default.join(appPath, 'config/validator.js');
    }
    log(`load file: ${filepath}`);
    const data = _safeRequire(filepath, true) || {};
    return data;
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

    return obj && obj.__esModule ? obj.default : obj;
}