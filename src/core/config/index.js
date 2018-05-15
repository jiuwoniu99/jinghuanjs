//import helper from '../helper';
//import loadFiles from '../helper/loadFiles';
//import path from 'path';
//import each from 'lodash/each';
import debug from 'debug';
import loadConfig from '../loader/config';
import get from 'lodash/get';
import set from 'lodash/set'
import merge from 'lodash/merge'

const LoaderConfig = new loadConfig();
const log = debug('JH:core/config');
const localCache = {};

let Config;

/**
 *
 * @param name
 */
function configGet(name) {
    let config = merge({}, Config, localCache);
    return get(config, name)
}

/**
 *
 * @param name
 * @param value
 */
function configSet(name, value) {
    return set(localCache, name, value);
}

/**
 *
 * @param config
 * @param configPaths
 * @param name
 */
//function loadConfigByName(config, configPaths, name) {
//    configPaths.forEach(configPath => {
//        const filepath = path.join(configPath, name);
//        if (helper.isFile(filepath)) {
//            log(`load file: ${filepath}`);
//            config = helper.extend(config, require(filepath));
//        }
//    });
//}

/**
 *
 * @param configPaths
 * @param env
 * @param name
 */
//function loadConfig(configPaths, env, name = 'config') {
//    const config = {};
//    loadConfigByName(config, configPaths, `${name}.js`);
//    return config;
//}

/**
 *
 * @param configPath
 * @return {{}}
 */
//function loadConfigFile(configPath) {
//    const configFiles = loadFiles(configPath, 'js');
//    const config = {};
//    each(configFiles, (path, name) => {
//        config[name] = require(path);
//    });
//    return config;
//}


/**
 *
 * @return {Function}
 */
function config() {
    
    // 模式为lib时初始化就开始加载所有配置
    if (jinghuan.mode === 'lib') {
        Config = LoaderConfig.load(localCache);
    }
    /**
     *
     * @param name
     * @param value
     * @return {*}
     */
    return function (name, value) {
        if (!Config) {
            Config = LoaderConfig.load(localCache);
        }
        if (value === undefined) {
            return configGet(name);
        }
        return configSet(name, value);
    }
    
}

export default config;
