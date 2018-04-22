'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var pathToRegexp = require('path-to-regexp');

/**
 *
 * @param options
 * @param app
 * @return {Function}
 */
module.exports = function (options, app) {
    /**
     *
     */
    return function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(ctx, next) {
            var pathname, _pathname, module, controller, action;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            pathname = ctx.path || '';

                            pathname = pathname.trim().replace(/\/+/ig, '/');
                            pathname = pathname.replace(/(^\/*)|(\/*$)/g, '');
                            pathname = pathname.split('/');
                            _pathname = pathname, module = _pathname[0], controller = _pathname[1], action = _pathname[2];
                            //let module = pathname.shift();
                            //let action = pathname.shift();
                            //let controller = pathname.shift();

                            ctx.module = module || 'index';
                            ctx.controller = controller || 'index';
                            ctx.action = action || 'index';

                            _context.next = 10;
                            return next();

                        case 10:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }();
};