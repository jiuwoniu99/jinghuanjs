'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const helper = _safeRequire('../helper');

const debug = _safeRequire('debug');

const isFunction = _safeRequire('lodash/isFunction');

const isArray = _safeRequire('lodash/isArray');

const log = debug(`JH:core/events[${process.pid}]`);
const EVENTS = Symbol('events');

let Events = class Events {
    constructor() {
        this[EVENTS] = {};
    }

    on(name, listener) {
        log(`on ${name}`);
        if (!isFunction(listener)) {
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
            if (isArray(listeners)) {
                for (let listener of listeners) {
                    if (isFunction(listener)) {
                        yield listener(...args);
                    }
                }
            }
        })();
    }

    un(name, listener) {
        log(`un ${name}`);
        let listeners = this[EVENTS][name];
        if (isArray(listeners)) {
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