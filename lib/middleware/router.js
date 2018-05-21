'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function invokeRouter(options, app) {
    return (() => {
        var _ref = _asyncToGenerator(function* (ctx, next) {

            let pathname = ctx.path || '';
            pathname = pathname.trim().replace(/\/+/ig, '/');
            pathname = pathname.replace(/(^\/*)|(\/*$)/g, '');
            pathname = pathname.split('/');
            let [module, controller, action] = pathname;

            ctx.module = module || 'index';
            ctx.controller = controller || 'index';
            ctx.action = action || 'index';

            yield next();
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })();
};

exports.default = invokeRouter;

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