"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

const helper = _safeRequire("../helper");

const path = _safeRequire("path");

const debug = _safeRequire("debug");

const log = debug(`JH:core/loader/bootstrap[${process.pid}]`);

function loadBootstrap(appPath, modules, type = 'worker') {
    let bootstrapPath = path.join(jinghuan.ROOT_PATH, jinghuan.source, '/common/bootstrap');
    const filepath = path.join(bootstrapPath, `${type}.js`);
    if (helper.isFile(filepath)) {
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

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}