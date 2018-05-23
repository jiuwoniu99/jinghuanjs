'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const isArray = _safeRequire('lodash/isArray');

const prettyBytes = _safeRequire('pretty-bytes');

function sokketStart(options, app) {
    return (() => {
        var _ref = _asyncToGenerator(function* (ctx, next) {
            let st = new Date().getTime();
            try {
                if (isArray(jinghuan.HOST) || jinghuan.HOST.indexOf(ctx.hostname) !== -1) {
                    yield next();
                }
            } catch (ex) {
                ctx.status = 500;
                ctx.slog.error(ex);
            } finally {
                let et = new Date().getTime();
                ctx.slog.send(et - st);
            }
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })();
};

exports.default = sokketStart;

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