"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _prettyBytes = require("pretty-bytes");

var _prettyBytes2 = _interopRequireDefault(_prettyBytes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

            ctx.slog.info(`进程常驻内存:${(0, _prettyBytes2.default)(rss)} ; 已申请的堆内存:${(0, _prettyBytes2.default)(heapTotal)} ; 已使用的内存:${(0, _prettyBytes2.default)(heapUsed)}`);
        });

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    })();
};

exports.default = invokeJsonRpc;