'use strict';

var assert = require('assert');
var debug = require('debug')('JH:core/gc[' + process.pid + ']');
//const _ = require('lodash');
//
var helper = require('../helper');
// min interval, 1 hour
var MIN_STEP = 3600 * 1000;
var intervalTimes = 0;
var gcTypes = {};
var timerStart = false;

function gc(instance) {
    var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : MIN_STEP;
    var MIN_INTERVAL = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : MIN_STEP;

    assert(instance && helper.isFunction(instance.gc), 'instance.gc must be a function');
    assert(instance && helper.isString(instance.gcType), 'instance.gcType must be a string');
    if (gcTypes[instance.gcType]) return;

    gcTypes[instance.gcType] = function () {
        if (helper.isFunction(interval)) {
            if (!interval()) return;
        } else {
            interval = helper.ms(interval);
            var num = Math.floor(interval / MIN_INTERVAL);
            if (intervalTimes % num !== 0) return;
        }
        debug('run gc, type: ' + instance.gcType);
        instance.gc();
    };

    if (!timerStart) {
        timerStart = true;
        var timer = setInterval(function () {
            intervalTimes++;
            for (var type in gcTypes) {
                gcTypes[type]();
            }
        }, MIN_INTERVAL);
        timer.unref && timer.unref();
    }
}

module.exports = gc;