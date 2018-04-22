'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var fs = require('fs');
var helper = require('../core/helper');

/**
 * 程序在初始化时开始执行
 * @param options
 * @param app
 * @return {function(*=, *)}
 */
module.exports = function (options, app) {
    /**
     *
     */
    return function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(ctx, next) {
            var st, et, _et;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            st = new Date().getTime();
                            _context.prev = 1;
                            _context.next = 4;
                            return next();

                        case 4:
                            et = new Date().getTime();

                            ctx.slog.send(et - st);
                            _context.next = 14;
                            break;

                        case 8:
                            _context.prev = 8;
                            _context.t0 = _context['catch'](1);
                            _et = new Date().getTime();

                            ctx.status = 500;
                            ctx.slog.error(_context.t0);
                            ctx.slog.send(_et - st);

                        case 14:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, undefined, [[1, 8]]);
        }));

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }();
};