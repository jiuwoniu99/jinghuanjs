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

module.exports = function (options, app) {
    var _this = this;

    /**
     *
     */
    return function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(ctx, next) {
            var origin, AccessControlRequestHeaders, AccessControlRequestMethod, headers;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            origin = ctx.header.origin;
                            AccessControlRequestHeaders = ctx.header['access-control-request-headers'];
                            AccessControlRequestMethod = ctx.header['access-control-request-method'];
                            //console.log(ctx.header)

                            if (!origin) {
                                _context.next = 16;
                                break;
                            }

                            headers = {
                                'Access-Control-Allow-Origin': origin,
                                'Access-Control-Allow-Credentials': 'true'
                            };


                            if (AccessControlRequestHeaders) {
                                headers['Access-Control-Allow-Headers'] = AccessControlRequestHeaders;
                            }
                            if (AccessControlRequestMethod) {
                                headers['Access-Control-Allow-Method'] = AccessControlRequestMethod;
                            }

                            ctx.set(headers);

                            if (!ctx.isMethod('options')) {
                                _context.next = 12;
                                break;
                            }

                            ctx.body = '';
                            _context.next = 14;
                            break;

                        case 12:
                            _context.next = 14;
                            return next();

                        case 14:
                            _context.next = 18;
                            break;

                        case 16:
                            _context.next = 18;
                            return next();

                        case 18:
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