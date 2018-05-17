"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _helper = require("../helper");

var _helper2 = _interopRequireDefault(_helper);

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)(`JH:core/gc[${process.pid}]`);

const MIN_STEP = 3600 * 1000;
let intervalTimes = 0;
const gcTypes = {};
let timerStart = false;

function gc(instance, interval = MIN_STEP, MIN_INTERVAL = MIN_STEP) {
    (0, _assert2.default)(instance && _helper2.default.isFunction(instance.gc), 'instance.gc must be a function');
    (0, _assert2.default)(instance && _helper2.default.isString(instance.gcType), 'instance.gcType must be a string');
    if (gcTypes[instance.gcType]) return;

    gcTypes[instance.gcType] = function () {
        if (_helper2.default.isFunction(interval)) {
            if (!interval()) return;
        } else {
            interval = _helper2.default.ms(interval);
            const num = Math.floor(interval / MIN_INTERVAL);
            if (intervalTimes % num !== 0) return;
        }
        log(`run gc, type: ${instance.gcType}`);
        instance.gc();
    };

    if (!timerStart) {
        timerStart = true;
        const timer = setInterval(() => {
            intervalTimes++;
            for (const type in gcTypes) {
                gcTypes[type]();
            }
        }, MIN_INTERVAL);
        timer.unref && timer.unref();
    }
}

exports.default = gc;