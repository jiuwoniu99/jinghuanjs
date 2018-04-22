'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
//
//const _ = require('lodash');
var each = require('lodash/each');

var assert = require('assert');
var debug = require('debug')('JH:core/loader/config[' + process.pid + ']');
//
var interopRequire = require('./util.js').interopRequire;
var loadFiles = require('../helper/loadFiles');
var helper = require('../helper');

/**
 * load config
 */

var Config = function () {
    function Config() {
        _classCallCheck(this, Config);
    }

    /**
     * load config and merge
     * @param {Object} config
     * @param {Array} configPaths
     * @param {String} name
     */
    Config.prototype.loadConfigByName = function loadConfigByName(config, configPaths, name) {
        configPaths.forEach(function (configPath) {
            var filepath = path.join(configPath, name);
            if (helper.isFile(filepath)) {
                debug('load file: ' + filepath);
                config = helper.extend(config, require(filepath));
            }
        });
    };

    /**
     *
     * @param configPaths
     * @param env
     * @param name
     * @return {{}}
     */


    Config.prototype.loadConfig = function loadConfig(configPaths, env) {
        var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'config';

        var config = {};
        this.loadConfigByName(config, configPaths, name + '.js');
        //this.loadConfigByName(config, configPaths, `${name}.${env}.js`);
        return config;
    };

    /**
     *
     * @param adapterPath
     * @return {{}}
     */


    Config.prototype.loadAdapter = function loadAdapter(adapterPath) {
        var files = helper.getdirFiles(adapterPath);
        var ret = {};
        files.forEach(function (file) {
            if (!/\.js$/.test(file)) {
                return;
            } // only load js files
            var item = file.replace(/\.\w+$/, '').split(path.sep);
            if (item.length !== 2 || !item[0] || !item[1]) {
                return;
            }
            if (!ret[item[0]]) {
                ret[item[0]] = {};
            }
            var filepath = path.join(adapterPath, file);
            debug('load adapter file: ' + filepath);
            ret[item[0]][item[1]] = interopRequire(filepath);
        });
        return ret;
    };

    /**
     *
     * @param config
     * @param appAdapters
     * @return {*}
     */


    Config.prototype.formatAdapter = function formatAdapter(config, appAdapters) {
        for (var name in config) {
            assert(helper.isObject(config[name]), 'adapter.' + name + ' must be an object');
            // ignore adapter when is emtpy, only has key
            if (helper.isEmpty(config[name])) {
                continue;
            }
            assert(config[name].type, 'adapter.' + name + ' must have type field');
            if (!config[name].common) {
                continue;
            }
            var common = config[name].common;
            assert(helper.isObject(common), 'adapter.' + name + '.common must be an object');
            delete config[name].common;
            for (var type in config[name]) {
                if (type === 'type') {
                    continue;
                }
                var item = config[name][type];
                if (!helper.isObject(item)) {
                    continue;
                }
                // merge common field to item
                item = helper.extend({}, common, item);
                // convert string handle to class
                if (item.handle && helper.isString(item.handle)) {
                    assert(name in appAdapters && appAdapters[name][item.handle], 'can not find ' + name + '.' + type + '.handle');
                    item.handle = appAdapters[name][item.handle];
                }
                config[name][type] = item;
            }
        }
        return config;
    };

    /**
     *
     * @param appPath
     * @param jinghuanPath
     * @param env
     * @param modules
     * @return {{}}
     */


    Config.prototype.load = function load() /*appPath, jinghuanPath, env, modules*/{
        var _jinghuan = jinghuan,
            ROOT_PATH = _jinghuan.ROOT_PATH,
            JH_PATH = _jinghuan.JH_PATH,
            env = _jinghuan.env;

        // let appPath = jinghuan.APP_PATH;
        // let jinghuanPath = jinghuan.JH_PATH;
        // let env = jinghuan.env;
        // let modules = jinghuan.app.modules;

        // 核心配置文件

        var jinghuanConfig = this.loadConfigFile(path.join(JH_PATH, 'config'));

        // 应用程序默认配置
        var commonConfig = this.loadConfigFile(path.join(ROOT_PATH, 'common', 'config'));

        // 应用配置
        var envConfig = this.loadConfigFile(path.join(ROOT_PATH, 'config', env));

        var paths = [path.join(JH_PATH, 'bootstrap'), path.join(ROOT_PATH, 'common/bootstrap')];

        var config = this.loadConfig(paths, env);

        var result = helper.extend({}, config, jinghuanConfig, commonConfig, envConfig, true);

        return result;
    };

    /**
     *
     * @param configPath
     * @return {{}}
     */


    Config.prototype.loadConfigFile = function loadConfigFile(configPath) {
        var configFiles = loadFiles(configPath, 'js');
        var config = {};
        each(configFiles, function (path, name) {
            config[name] = interopRequire(path);
        });
        return config;
    };

    return Config;
}();

module.exports = Config;