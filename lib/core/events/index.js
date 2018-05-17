'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helper = require('../helper');

var _helper2 = _interopRequireDefault(_helper);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const log = (0, _debug2.default)(`JH:core/events[${process.pid}]`);
const EVENTS = Symbol('events');

let Events = class Events {
    constructor() {
        this[EVENTS] = {};
    }

    on(name, listener) {
        log(`on ${name}`);
        if (!(0, _isFunction2.default)(listener)) {
            throw TypeError('listener must be a function');
        }
        this[EVENTS][name] = this[EVENTS]['name'] || [];
        this[EVENTS][name].push(listener);
    }

    emit(name, ...args) {
        var _this = this;

        return _asyncToGenerator(function* () {
            log(`emit ${name}`);
            let listeners = _this[EVENTS][name];
            if ((0, _isArray2.default)(listeners)) {
                for (let listener of listeners) {
                    if ((0, _isFunction2.default)(listener)) {
                        yield listener(...args);
                    }
                }
            }
        })();
    }

    un(name, listener) {
        log(`un ${name}`);
        let listeners = this[EVENTS][name];
        if ((0, _isArray2.default)(listeners)) {
            for (let i in listeners) {
                if (listeners[i] == listener) {
                    delete listeners[i];
                }
            }
        }
    }

    isEvent(name) {
        return this[EVENTS][name] != null && this[EVENTS][name].length > 0;
    }
};
exports.default = Events;