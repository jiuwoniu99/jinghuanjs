'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (ctx, symbol, create = true) {
    let { module, controller, action } = ctx;
    try {
        let file = get(jinghuan.controllers, `${module}.${controller}`);

        let Controller = _safeRequire(file);
        if (helper.isEmpty(Controller)) {
            return false;
        }

        if (!Controller.prototype[symbol]) {
            return false;
        }
        if (create) {
            const instance = new Controller(ctx);
            if (helper.isEmpty(instance.ctx)) {
                instance.ctx = ctx;
            }

            return instance;
        } else {
            return Controller;
        }
    } catch (e) {
        return false;
    }
};

const helper = _safeRequire('./index');

const get = _safeRequire('lodash/get');

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