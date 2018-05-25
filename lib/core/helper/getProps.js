'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (ctx, props, name) {
    let { module, controller, action } = ctx;
    try {
        let file = get(jinghuan.controllers, `${module}.${controller}`);

        let Controller = _safeRequire(file);
        if (helper.isEmpty(Controller)) {
            return false;
        }

        let prop = Controller.prototype[props.name];

        if (!prop || !prop[name]) {
            return false;
        }

        return prop[name];
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