import path from 'path';
import each from 'lodash/each';
//import assert from 'assert';
import loadFiles from '../helper/loadFiles';
import helper from '../helper';
import debug from 'debug';
import merge from 'lodash/merge';

const log = debug(`JH:core/loader/config[${process.pid}]`);

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
                log(`load file: ${filepath}`);
                config = merge(config, require(filepath));
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
        return config;
    }
    
    /**
     *
     * @param adapterPath
     * @return {{}}
     */
    //loadAdapter(adapterPath) {
    //    const files = helper.getdirFiles(adapterPath);
    //    const ret = {};
    //    files.forEach(file => {
    //        if (!/\.js$/.test(file)) {
    //            return;
    //        } // only load js files
    //        const item = file.replace(/\.\w+$/, '').split(path.sep);
    //        if (item.length !== 2 || !item[0] || !item[1]) {
    //            return;
    //        }
    //        if (!ret[item[0]]) {
    //            ret[item[0]] = {};
    //        }
    //        const filepath = path.join(adapterPath, file);
    //        log(`load adapter file: ${filepath}`);
    //        ret[item[0]][item[1]] = require(filepath);
    //    });
    //    return ret;
    //}
    
    /**
     *
     * @param config
     * @param appAdapters
     * @return {*}
     */
    //formatAdapter(config, appAdapters) {
    //    for (const name in config) {
    //        assert(helper.isObject(config[name]), `adapter.${name} must be an object`);
    //        // ignore adapter when is emtpy, only has key
    //        if (helper.isEmpty(config[name])) {
    //            continue;
    //        }
    //        assert(config[name].type, `adapter.${name} must have type field`);
    //        if (!config[name].common) {
    //            continue;
    //        }
    //        const common = config[name].common;
    //        assert(helper.isObject(common), `adapter.${name}.common must be an object`);
    //        delete config[name].common;
    //        for (const type in config[name]) {
    //            if (type === 'type') {
    //                continue;
    //            }
    //            let item = config[name][type];
    //            if (!helper.isObject(item)) {
    //                continue;
    //            }
    //            // merge common field to item
    //            item = merge({}, common, item);
    //            // convert string handle to class
    //            if (item.handle && helper.isString(item.handle)) {
    //                assert(name in appAdapters && appAdapters[name][item.handle], `can not find ${name}.${type}.handle`);
    //                item.handle = appAdapters[name][item.handle];
    //            }
    //            config[name][type] = item;
    //        }
    //    }
    //    return config;
    //}
    
    /**
     *
     * @return {*}
     */
    load(extendConfig = {}) {
        
        let {ROOT_PATH, JH_PATH, env} = jinghuan;
        
        // 核心配置文件
        const jinghuanConfig = this.loadConfigFile(path.join(JH_PATH, 'config'));
        
        // 应用程序默认配置
        const commonConfig = this.loadConfigFile(path.join(ROOT_PATH, jinghuan.source, '/common/config'));
        
        // 应用配置
        const envConfig = this.loadConfigFile(path.join(ROOT_PATH, 'config', env));
        
        const paths = [
            path.join(JH_PATH, 'bootstrap'),
            path.join(ROOT_PATH, jinghuan.source, 'common/bootstrap')
        ];
        
        const bootstrapConfig = this.loadConfig(paths, env);
        
        return merge({}, bootstrapConfig, jinghuanConfig, commonConfig, envConfig, extendConfig, true);
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
            config[name] = require(path);
        });
        return config;
    }
    
}

export default Config;
