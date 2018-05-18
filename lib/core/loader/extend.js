"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _helper = require("../helper");

var _helper2 = _interopRequireDefault(_helper);

var _util = require("./util.js");

var _util2 = _interopRequireDefault(_util);

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)(`JH:core/loader/extend[${process.pid}]`);

const ExtendLoader = {

    allowExtends: ['jinghuan', 'application', 'context', 'controller'],

    load(extendPath, modules) {
        const allowExtends = ExtendLoader.allowExtends;
        const ret = {};

        function assign(type, ext) {
            if (!ret[type]) {
                ret[type] = {};
            }
            ret[type] = _util2.default.extend(ret[type], ext);
        }

        allowExtends.forEach(type => {
            const filepath = _path2.default.join(extendPath, `extend/${type}.js`);
            if (!_helper2.default.isFile(filepath)) {
                return;
            }
            log(`load file: ${filepath}`);
            assign(type, _safeRequire(filepath));
        });

        return ret;
    }
};

exports.default = ExtendLoader;

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