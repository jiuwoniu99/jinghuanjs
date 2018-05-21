"use strict";

module.exports = {
    onUnhandledRejection: err => jinghuan.logger.error(err),
    onUncaughtException: err => jinghuan.logger.error(err) };

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