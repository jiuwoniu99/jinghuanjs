const path = require('path');
//
//const _ = require('lodash');
const each = require('lodash/each');

const assert = require('assert');
const debug = require('debug')(`JH:core/loader/config[${process.pid}]`);
//
const interopRequire = require('./util.js').interopRequire;
const loadFiles = require('../helper/loadFiles');
const helper = require('../helper');

/**
 * load config
 */
class Config {

    /**
     * load config and merge
     * @param {Object} config
     * @param {Array} configPaths
     * @param {String} name
     */
    loadConfigByName(config, configPaths, name) {
        configPaths.forEach(configPath => {
            const filepath = path.join(configPath, name);
            if (helper.isFile(filepath)) {
                debug(`load file: ${filepath}`);
                config = helper.extend(config, require(filepath));
            }
        });
    }

    /**
     *
     * @param configPaths
     * @param env
     * @param name
     * @return {{}}
     */
    loadConfig(configPaths, env, name = 'config') {
        const config = {};
        this.loadConfigByName(config, configPaths, `${name}.js`);
        //this.loadConfigByName(config, configPaths, `${name}.${env}.js`);
        return config;
    }

    /**
     *
     * @param adapterPath
     * @return {{}}
     */
    loadAdapter(adapterPath) {
        const files = helper.getdirFiles(adapterPath);
        const ret = {};
        files.forEach(file => {
            if (!/\.js$/.test(file)) {
                return;
            } // only load js files
            const item = file.replace(/\.\w+$/, '').split(path.sep);
            if (item.length !== 2 || !item[0] || !item[1]) {
                return;
            }
            if (!ret[item[0]]) {
                ret[item[0]] = {};
            }
            const filepath = path.join(adapterPath, file);
            debug(`load adapter file: ${filepath}`);
            ret[item[0]][item[1]] = interopRequire(filepath);
        });
        return ret;
    }

    /**
     *
     * @param config
     * @param appAdapters
     * @return {*}
     */
    formatAdapter(config, appAdapters) {
        for (const name in config) {
            assert(helper.isObject(config[name]), `adapter.${name} must be an object`);
            // ignore adapter when is emtpy, only has key
            if (helper.isEmpty(config[name])) {
                continue;
            }
            assert(config[name].type, `adapter.${name} must have type field`);
            if (!config[name].common) {
                continue;
            }
            const common = config[name].common;
            assert(helper.isObject(common), `adapter.${name}.common must be an object`);
            delete config[name].common;
            for (const type in config[name]) {
                if (type === 'type') {
                    continue;
                }
                let item = config[name][type];
                if (!helper.isObject(item)) {
                    continue;
                }
                // merge common field to item
                item = helper.extend({}, common, item);
                // convert string handle to class
                if (item.handle && helper.isString(item.handle)) {
                    assert(name in appAdapters && appAdapters[name][item.handle], `can not find ${name}.${type}.handle`);
                    item.handle = appAdapters[name][item.handle];
                }
                config[name][type] = item;
            }
        }
        return config;
    }

    /**
     *
     * @param appPath
     * @param jinghuanPath
     * @param env
     * @param modules
     * @return {{}}
     */
    load(/*appPath, jinghuanPath, env, modules*/) {

        let {ROOT_PATH, JH_PATH, env} = jinghuan;

        // let appPath = jinghuan.APP_PATH;
        // let jinghuanPath = jinghuan.JH_PATH;
        // let env = jinghuan.env;
        // let modules = jinghuan.app.modules;

        // 核心配置文件
        const jinghuanConfig = this.loadConfigFile(path.join(JH_PATH, 'lib', 'config'));

        // 应用程序默认配置
        const commonConfig = this.loadConfigFile(path.join(ROOT_PATH, 'common', 'config'));

        // 应用配置
        const envConfig = this.loadConfigFile(path.join(ROOT_PATH, 'config', env));

        const paths = [
            path.join(JH_PATH, 'lib/bootstrap'),
            path.join(ROOT_PATH, 'common/bootstrap')
        ];

        const config = this.loadConfig(paths, env);

        const result = helper.extend({}, config, jinghuanConfig, commonConfig, envConfig, true);

        return result;
    }

    /**
     *
     * @param configPath
     * @return {{}}
     */
    loadConfigFile(configPath) {
        const configFiles = loadFiles(configPath, 'js');
        const config = {};
        each(configFiles, (path, name) => {
            config[name] = interopRequire(path);
        });
        return config;
    }

}

module.exports = Config;
