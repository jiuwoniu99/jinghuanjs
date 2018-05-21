"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

const path = _safeRequire("path");

const helper = _safeRequire("../helper");

const util = _safeRequire("./util.js");

const debug = _safeRequire("debug");

const log = debug(`JH:core/loader/extend[${process.pid}]`);

const ExtendLoader = {

    allowExtends: ['jinghuan', 'application', 'context', 'controller'],

    load(extendPath, modules) {
        const allowExtends = ExtendLoader.allowExtends;
        const ret = {};

        function assign(type, ext) {
            if (!ret[type]) {
                ret[type] = {};
            }
            ret[type] = util.extend(ret[type], ext);
        }

        allowExtends.forEach(type => {
            const filepath = path.join(extendPath, `extend/${type}.js`);
            if (!helper.isFile(filepath)) {
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

    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}