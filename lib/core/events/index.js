'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//
//const _ = require('lodash');
var debug = require('debug')('JH:core/events[' + process.pid + ']');
var helper = require('../helper');
//
var EVENTS = Symbol('events');

/**
 *
 */

var Events = function () {
    function Events() {
        _classCallCheck(this, Events);

        this[EVENTS] = {};
    }

    /**
     *
     * @param name
     * @param listener
     * @return {Promise<void>}
     */


    Events.prototype.on = function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(name, listener) {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            debug('on ' + name);

                            if (helper.isFunction(listener)) {
                                _context.next = 3;
                                break;
                            }

                            throw TypeError('listener must be a function');

                        case 3:
                            this[EVENTS][name] = this[EVENTS]['name'] || [];
                            this[EVENTS][name].push(listener);

                        case 5:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function on(_x, _x2) {
            return _ref.apply(this, arguments);
        }

        return on;
    }();

    /**
     *
     * @param name
     * @param args
     * @return {Promise<void>}
     */


    Events.prototype.emit = function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(name) {
            var listeners,
                _len,
                args,
                _key,
                _iterator,
                _isArray,
                _i,
                _ref3,
                listener,
                _args2 = arguments;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            debug('emit ' + name);
                            listeners = this[EVENTS][name];

                            if (!helper.isArray(listeners)) {
                                _context2.next = 21;
                                break;
                            }

                            for (_len = _args2.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                                args[_key - 1] = _args2[_key];
                            }

                            _iterator = listeners, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();

                        case 5:
                            if (!_isArray) {
                                _context2.next = 11;
                                break;
                            }

                            if (!(_i >= _iterator.length)) {
                                _context2.next = 8;
                                break;
                            }

                            return _context2.abrupt('break', 21);

                        case 8:
                            _ref3 = _iterator[_i++];
                            _context2.next = 15;
                            break;

                        case 11:
                            _i = _iterator.next();

                            if (!_i.done) {
                                _context2.next = 14;
                                break;
                            }

                            return _context2.abrupt('break', 21);

                        case 14:
                            _ref3 = _i.value;

                        case 15:
                            listener = _ref3;

                            if (!helper.isFunction(listener)) {
                                _context2.next = 19;
                                break;
                            }

                            _context2.next = 19;
                            return listener.apply(undefined, args);

                        case 19:
                            _context2.next = 5;
                            break;

                        case 21:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function emit(_x3) {
            return _ref2.apply(this, arguments);
        }

        return emit;
    }();

    /**
     *
     * @param name
     * @param listener
     * @return {Promise<void>}
     */


    Events.prototype.un = function () {
        var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(name, listener) {
            var listeners, i;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            debug('un ' + name);
                            listeners = this[EVENTS][name];

                            if (helper.isArray(listeners)) {
                                for (i in listeners) {
                                    if (listeners[i] == listener) {
                                        delete listeners[i];
                                    }
                                }
                            }

                        case 3:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function un(_x4, _x5) {
            return _ref4.apply(this, arguments);
        }

        return un;
    }();

    return Events;
}();

module.exports = Events;