"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

const util = _safeRequire("./lib/util");

const Messenger = _safeRequire("./lib/messenger.js");

const Worker = _safeRequire("./lib/worker.js");

const Master = _safeRequire("./lib/master.js");

let messenger = new Messenger();

exports.default = {
    Worker, Master, messenger
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