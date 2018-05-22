"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const prettyBytes = _safeRequire("pretty-bytes");

function invokeJsonRpc(options, app) {
    return (() => {
        var _ref = _asyncToGenerator(function* (ctx, next) {
            yield next();
            let {
                rss,
                heapTotal,
                heapUsed,
                external
            } = process.memoryUsage();

            ctx.slog.info(`进程常驻内存:${prettyBytes(rss)} ; 已申请的堆内存:${prettyBytes(heapTotal)} ; 已使用的内存:${prettyBytes(heapUsed)}`);
            ctx.websocket.send(`进程常驻内存:${prettyBytes(rss)} ; 已申请的堆内存:${prettyBytes(heapTotal)} ; 已使用的内存:${prettyBytes(heapUsed)}`);
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })();
};

exports.default = invokeJsonRpc;

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