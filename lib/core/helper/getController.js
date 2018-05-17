'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (ctx, symbol, name) {
    let { module, controller, action } = ctx;
    try {
        let file = jinghuan.app.controllers[module][controller];

        let Controller = _safeRequire(file);
        if (_index2.default.isEmpty(Controller)) {
            return false;
        }

        if (!Controller.prototype[symbol]) {
            return false;
        }

        const instance = new Controller(ctx);
        if (_index2.default.isEmpty(instance.ctx)) {
            instance.ctx = ctx;
        }

        return instance;
    } catch (e) {
        return false;
    }
};

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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