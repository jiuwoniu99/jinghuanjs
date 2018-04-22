'use strict';

var helper = require('../helper');
//const _ = require('lodash');
/**
 * interop require
 */
exports.interopRequire = function (obj, safe) {
    if (helper.isString(obj)) {
        if (safe) {
            try {
                obj = require(obj);
            } catch (e) {
                console.error(e);
                obj = null;
            }
        } else {
            obj = require(obj);
        }
    }
    return obj && obj.__esModule ? obj.default : obj;
};

/**
 * extend, support getter/setter
 */
exports.extend = function (target, source) {
    var properties = Object.getOwnPropertyNames(source).concat(Object.getOwnPropertySymbols(source));
    var length = properties.length;
    for (var i = 0; i < length; i++) {
        var property = properties[i];
        var descriptor = Object.getOwnPropertyDescriptor(source, property);
        if (descriptor.get && descriptor.set) {
            // target.__defineGetter__(property, descriptor.get);
            // target.__defineSetter__(property, descriptor.set);
            Object.defineProperty(target, property, {
                configurable: true,
                get: descriptor.get,
                set: descriptor.set
            });
        } else if (descriptor.get) {
            // target.__defineGetter__(property, descriptor.get);
            Object.defineProperty(target, property, {
                configurable: true,
                get: descriptor.get
            });
        } else if (descriptor.set) {
            // target.__defineSetter__(property, descriptor.set);
            Object.defineProperty(target, property, {
                /* eslint accessor-pairs: ["error", { "setWithoutGet": false }] */
                configurable: true,
                set: descriptor.set
            });
        } else if (descriptor.hasOwnProperty('value')) {
            // could be undefined but writable
            target[property] = descriptor.value;
        }
    }
    return target;
};