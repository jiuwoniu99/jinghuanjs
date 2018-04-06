'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var helper = require('../helper');
var each = require('lodash/each');

/**
 * config manage
 */

var Config = function () {
    /**
     * constructor
     * @param {config} config data
     */
    function Config() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Config);

        this.config = config;
    }

    /**
     *
     * @param name
     * @param config
     * @return {*}
     */


    Config.prototype.get = function get(name, config) {
        if (!name) {
            return this.config;
        }
        config = config || this.config;
        if (name.indexOf('.') === -1) {
            return config[name];
        }
        name = name.split('.');
        var length = name.length;
        name.some(function (item, index) {
            config = config[item];
            if (index !== length - 1 && !helper.isObject(config)) {
                config = undefined;
                return true;
            }
        });
        return config;
    };

    /**
     * set config
     * set('name', 'value'), set('foo.bar', 'value')
     */


    Config.prototype.set = function set(name, value) {
        if (name.indexOf('.') === -1) {
            this.config[name] = value;
        }
        var config = this.config;
        name = name.split('.');
        var length = name.length;
        name.forEach(function (item, index) {
            if (index === length - 1) {
                config[item] = value;
            } else {
                if (!helper.isObject(config[item])) {
                    config[item] = {};
                }
                config = config[item];
            }
        });
        return this;
    };

    return Config;
}();

/**
 *
 * @param configs
 * @return {function(*=, *=)}
 */


function getConfigFn(configs) {
    var configInstances = new Config(configs);
    return function (name, value) {
        var conf = configInstances;
        if (value === undefined) {
            return conf.get(name);
        }
        return conf.set(name, value);
    };
}

module.exports = getConfigFn;