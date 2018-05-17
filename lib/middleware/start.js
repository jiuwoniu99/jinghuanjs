'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _prettyBytes = require('pretty-bytes');

var _prettyBytes2 = _interopRequireDefault(_prettyBytes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function invokeStart(options, app) {
    return (() => {
        var _ref = _asyncToGenerator(function* (ctx, next) {
            let st = new Date().getTime();
            try {
                if ((0, _isArray2.default)(jinghuan.HOST) || jinghuan.HOST.indexOf(ctx.hostname) !== -1) {
                    yield next();
                } else {
                    ctx.status = 404;
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

exports.default = invokeStart;