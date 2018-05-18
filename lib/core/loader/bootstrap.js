"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helper = require("../helper");

var _helper2 = _interopRequireDefault(_helper);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)(`JH:core/loader/bootstrap[${process.pid}]`);

function loadBootstrap(appPath, modules, type = 'worker') {
    let bootstrapPath = _path2.default.join(jinghuan.ROOT_PATH, jinghuan.source, '/common/bootstrap');
    const filepath = _path2.default.join(bootstrapPath, `${type}.js`);
    if (_helper2.default.isFile(filepath)) {
        log(`load file: ${filepath}`);
        return _safeRequire(filepath);
    }
}

exports.default = loadBootstrap;

function _safeRequire(obj) {
    if (typeof obj === 'string') {
        try {
            obj = require(obj);
        } catch (e) {
            console.error(e);
            obj = null;
        }
    }

    return obj && obj.__esModule ? obj.default || obj : obj;
}