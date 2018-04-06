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


    Events.prototype.on = function on(name, listener) {
        debug('on ' + name);
        if (!helper.isFunction(listener)) {
            throw TypeError('listener must be a function');
        }
        this[EVENTS][name] = this[EVENTS]['name'] || [];
        this[EVENTS][name].push(listener);
    };

    /**
     *
     * @param name
     * @param args
     * @return {Promise<void>}
     */


    Events.prototype.emit = function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(name) {
            var listeners,
                _len,
                args,
                _key,
                _iterator,
                _isArray,
                _i,
                _ref2,
                listener,
                _args = arguments;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            debug('emit ' + name);
                            listeners = this[EVENTS][name];

                            if (!helper.isArray(listeners)) {
                                _context.next = 21;
                                break;
                            }

                            for (_len = _args.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                                args[_key - 1] = _args[_key];
                            }

                            _iterator = listeners, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();

                        case 5:
                            if (!_isArray) {
                                _context.next = 11;
                                break;
                            }

                            if (!(_i >= _iterator.length)) {
                                _context.next = 8;
                                break;
                            }

                            return _context.abrupt('break', 21);

                        case 8:
                            _ref2 = _iterator[_i++];
                            _context.next = 15;
                            break;

                        case 11:
                            _i = _iterator.next();

                            if (!_i.done) {
                                _context.next = 14;
                                break;
                            }

                            return _context.abrupt('break', 21);

                        case 14:
                            _ref2 = _i.value;

                        case 15:
                            listener = _ref2;

                            if (!helper.isFunction(listener)) {
                                _context.next = 19;
                                break;
                            }

                            _context.next = 19;
                            return listener.apply(undefined, args);

                        case 19:
                            _context.next = 5;
                            break;

                        case 21:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function emit(_x) {
            return _ref.apply(this, arguments);
        }

        return emit;
    }();

    /**
     *
     * @param name
     * @param listener
     * @return {Promise<void>}
     */


    Events.prototype.un = function un(name, listener) {
        debug('un ' + name);
        var listeners = this[EVENTS][name];
        if (helper.isArray(listeners)) {
            for (var i in listeners) {
                if (listeners[i] == listener) {
                    delete listeners[i];
                }
            }
        }
    };

    /**
     *
     * @param name
     * @return {boolean}
     */


    Events.prototype.isEvent = function isEvent(name) {
        return this[EVENTS][name] != null && this[EVENTS][name].length > 0;
    };

    return Events;
}();

module.exports = Events;