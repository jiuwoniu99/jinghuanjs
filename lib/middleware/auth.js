'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var defaultOption = {
    module: 'home',
    controller: 'index',
    action: 'index'
};

/**
 *
 * @param options
 * @param app
 * @return {function(*, *)}
 */
module.exports = function (options, app) {
    var _this = this;

    /**
     *
     */
    return function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(ctx, next) {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!jinghuan.app.modules) {
                                _context.next = 5;
                                break;
                            }

                            if (!(jinghuan.app.modules.indexOf(ctx.module) !== -1)) {
                                _context.next = 5;
                                break;
                            }

                            _context.next = 4;
                            return next();

                        case 4:
                            return _context.abrupt('return');

                        case 5:
                            ctx.status = 403;

                        case 6:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }));

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }();
};